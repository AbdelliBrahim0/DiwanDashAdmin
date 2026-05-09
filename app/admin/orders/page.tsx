'use client'

import { useState, useEffect } from 'react'
import { API_V1_URL } from '@/lib/backend'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminHeader } from '@/components/admin-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  ExternalLink,
  ChevronDown,
  MapPin,
  Phone,
  Calendar,
  Trash2,
  Printer
} from 'lucide-react'

interface OrderItem {
  id: number
  product_id: string
  quantity: number
  price_at_purchase: number
  original_price?: number
  type: string
  source?: string
  product?: {
    name: string
    image_url?: string
  }
}

interface User {
  first_name: string
  last_name: string
  email: string
}

interface Order {
  id: string
  total_amount: number
  status: string
  shipping_address: string
  shipping_phone: string
  promo_code?: string
  discount_amount?: number
  created_at: string
  items: OrderItem[]
  user?: User
}

const translations = {
  fr: {
    orders: 'Gestion des Commandes',
    description: 'Suivez et gérez les ventes de votre boutique',
    search: 'Rechercher une commande...',
    orderId: 'Commande #',
    customer: 'Client',
    amount: 'Montant',
    status: 'Statut',
    date: 'Date & Heure',
    actions: 'Actions',
    items: 'articles',
    viewDetails: 'Détails',
    updateStatus: 'Mettre à jour le statut',
    noOrders: 'Aucune commande trouvée',
    loadError: 'Impossible de charger les commandes',
    statusPending: 'En attente',
    statusConfirmed: 'Confirmée',
    statusShipped: 'Expédiée',
    statusDelivered: 'Livrée',
    statusCancelled: 'Annulée',
    deleteBtn: 'Supprimer',
    confirmDelete: 'Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.',
    rent: 'Location',
    sell: 'Vente',
    prev: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    promotion: 'Promotion',
    subtotal: 'Sous-total',
    discount: 'Remise',
    total: 'Total à payer',
    print: 'Imprimer'
  },
  ar: {
    orders: 'إدارة الطلبات',
    description: 'تتبع وإدارة مبيعات متجرك',
    search: 'البحث عن طلب...',
    orderId: 'طلب #',
    customer: 'العميل',
    amount: 'المبلغ',
    status: 'الحالة',
    date: 'التاريخ والوقت',
    actions: 'الإجراءات',
    items: 'منتجات',
    viewDetails: 'التفاصيل',
    updateStatus: 'تحديث الحالة',
    noOrders: 'لم يتم العثور على طلبات',
    loadError: 'تعذر تحميل الطلبات',
    statusPending: 'في الانتظار',
    statusConfirmed: 'مؤكد',
    statusShipped: 'تم الشحن',
    statusDelivered: 'تم التوصيل',
    statusCancelled: 'ملغى',
    deleteBtn: 'حذف',
    confirmDelete: 'هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.',
    rent: 'تأجير',
    sell: 'بيع',
    prev: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    promotion: 'عرض ترويجي',
    subtotal: 'المجموع الفرعي',
    discount: 'خصم',
    total: 'المجموع الكلي',
    print: 'طباعة الطلب'
  },
}

const statusColors: Record<string, string> = {
  "En attente": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Confirmée": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Expédiée": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Livrée": "bg-green-500/10 text-green-500 border-green-500/20",
  "Annulée": "bg-destructive/10 text-destructive border-destructive/20",
}

export default function OrdersPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 5

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchOrders = async () => {
    const token = getAuthToken()
    if (!token) return

    setLoading(true)
    setApiError('')
    try {
      const skip = (page - 1) * limit
      const response = await fetch(`${API_V1_URL}/orders/?skip=${skip}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      fetchOrders()
    }
  }, [isHydrated, isLoggedIn, page])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const token = getAuthToken()
    if (!token) return

    setUpdatingId(orderId)
    try {
      const response = await fetch(`${API_V1_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Update failed')
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(t.confirmDelete)) return
    
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`${API_V1_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Delete failed')
      setOrders(orders.filter(order => order.id !== orderId))
    } catch {
      alert("Erreur lors de la suppression")
    }
  }

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const subtotal = order.total_amount + (order.discount_amount || 0);
    const dateStr = new Date(order.created_at).toLocaleString('fr-FR');

    const html = `
      <html>
        <head>
          <title>Facture Diwan Elite - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
            body { font-family: 'Outfit', sans-serif; color: #1a1a1a; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #c4a77d; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { display: flex; align-items: center; gap: 10px; }
            .logo-box { width: 40px; height: 40px; background: #000; color: #c4a77d; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 8px; }
            .brand { font-size: 24px; font-weight: 700; color: #000; letter-spacing: 2px; }
            .invoice-info { text-align: right; }
            .invoice-info h1 { margin: 0; font-size: 18px; color: #c4a77d; text-transform: uppercase; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .info-card { background: #f9f9f9; padding: 15px; border-radius: 12px; }
            .info-card p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background: #000; color: #fff; padding: 12px; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .totals { margin-left: auto; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .total-row.grand { border-top: 2px solid #000; margin-top: 10px; padding-top: 15px; font-weight: 700; font-size: 18px; color: #c4a77d; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <div class="logo-box">د</div>
              <div class="brand">DIWAN ELITE</div>
            </div>
            <div class="invoice-info">
              <h1>FACTURE / INVOICE</h1>
              <p style="font-size: 12px; color: #666; margin: 5px 0;">ID: #${order.id.substring(0, 8).toUpperCase()}</p>
              <p style="font-size: 12px; color: #666; margin: 0;">Date: ${dateStr}</p>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Client / Customer</div>
              <div class="info-card">
                <p><strong>${order.user?.first_name} ${order.user?.last_name}</strong></p>
                <p>${order.user?.email}</p>
                <p>${order.shipping_phone}</p>
              </div>
            </div>
            <div>
              <div class="section-title">Livraison / Shipping</div>
              <div class="info-card">
                <p>${order.shipping_address}</p>
              </div>
            </div>
          </div>

          <div class="section-title">Détails de la commande / Order Details</div>
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Type</th>
                <th>Prix Unit.</th>
                <th>Qté</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.product?.name}</strong><br/>
                    <small style="color: #666;">ID: ${item.product_id}</small>
                    ${item.source ? `<br/><small style="font-style: italic; color: #c4a77d;">Source: ${item.source}</small>` : ''}
                  </td>
                  <td>${item.type === 'rent' ? 'Location' : 'Vente'}</td>
                  <td>${item.price_at_purchase} DT</td>
                  <td>${item.quantity}</td>
                  <td>${item.price_at_purchase * item.quantity} DT</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total</span>
              <span>${subtotal} DT</span>
            </div>
            ${order.promo_code ? `
              <div class="total-row" style="color: #c4a77d;">
                <span>Remise Code (${order.promo_code})</span>
                <span>-${order.discount_amount} DT</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>TOTAL À PAYER</span>
              <span>${order.total_amount} DT</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre confiance envers <strong>Diwan Elite</strong>.</p>
            <p style="margin-top: 5px;">Diwan Elite Luxury Boutique & Bridal Wear</p>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${o.user?.first_name} ${o.user?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isHydrated) return null
  if (!isLoggedIn) return <LoginPage />

  const t = translations[lang]

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground">
      <AdminSidebar onLogout={handleLogout} lang={lang} />

      <main className="flex-1 lg:ml-0">
        <AdminHeader
          title={t.orders}
          description={t.description}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>

          {apiError && (
            <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-card/50 animate-pulse rounded-xl border border-border" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
              <p className="text-muted-foreground">{t.noOrders}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="bg-card border-border overflow-hidden hover:border-sidebar-primary transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{t.orderId}{order.id.slice(0, 8).toUpperCase()}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-sidebar-primary" />
                            {new Date(order.created_at).toLocaleString(lang === 'fr' ? 'fr-FR' : 'ar-EG')}
                          </span>
                          <span className="flex flex-col items-end gap-1">
                            {order.promo_code && (
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-accent font-bold px-1.5 py-0.5 bg-accent/10 rounded-full border border-accent/20 mb-1">
                                  CODE: {order.promo_code}
                                </span>
                                <span className="text-[10px] text-muted-foreground line-through opacity-60">
                                  {order.total_amount + (order.discount_amount || 0)} DT
                                </span>
                                <span className="text-[10px] text-accent font-medium">
                                  -{order.discount_amount} DT
                                </span>
                              </div>
                            )}
                            <span className="font-bold text-foreground text-lg">
                              {order.total_amount} DT
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-sidebar-primary"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                        >
                          <option value="En attente">{t.statusPending}</option>
                          <option value="Confirmée">{t.statusConfirmed}</option>
                          <option value="Expédiée">{t.statusShipped}</option>
                          <option value="Livrée">{t.statusDelivered}</option>
                          <option value="Annulée">{t.statusCancelled}</option>
                        </select>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-accent/30 text-accent hover:bg-accent/10"
                          onClick={() => handlePrint(order)}
                          title={t.print}
                        >
                          <Printer size={14} />
                        </Button>

                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteOrder(order.id)}
                          title={t.deleteBtn}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-sidebar-primary flex items-center gap-2">
                          <UserIcon size={14} />
                          {t.customer}
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium">{order.user?.first_name} {order.user?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-sidebar-primary flex items-center gap-2">
                          <MapPin size={14} />
                          Livraison
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            {order.shipping_address}
                          </p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Phone size={14} className="text-sidebar-primary" />
                            {order.shipping_phone}
                          </p>
                        </div>
                      </div>
                      {/* Order Items */}
                      <div className="space-y-3 lg:col-span-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-sidebar-primary flex items-center gap-2">
                          <ShoppingBag size={14} />
                          {t.items} ({order.items.length})
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-background/50 p-2 rounded-lg border border-border/30">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {item.product?.image_url && (
                                  <img src={item.product.image_url} alt="" className="object-cover w-full h-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold truncate text-foreground">{item.product?.name}</p>
                                  <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded">
                                    ID: #{item.product_id}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                    item.type === 'rent' ? 'bg-blue-500/10 text-blue-500' : 'bg-sidebar-primary/10 text-sidebar-primary'
                                  }`}>
                                    {item.type === 'rent' ? t.rent : t.sell}
                                  </span>
                                  {item.source && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium italic">
                                      {item.source}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    {item.original_price && item.original_price > item.price_at_purchase && (
                                      <span className="line-through opacity-50">{item.original_price} DT</span>
                                    )}
                                    <span className="font-bold text-foreground">{item.price_at_purchase} DT</span>
                                    <span>x {item.quantity}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-4 pb-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="gap-2"
            >
              <ChevronDown className={lang === 'fr' ? 'rotate-90' : '-rotate-90'} size={16} />
              {t.prev}
            </Button>
            <span className="text-sm font-medium">
              {t.page} {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredOrders.length < limit || loading}
              className="gap-2"
            >
              {t.next}
              <ChevronDown className={lang === 'fr' ? '-rotate-90' : 'rotate-90'} size={16} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
