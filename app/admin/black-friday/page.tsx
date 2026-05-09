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
import { Switch } from '@/components/ui/switch'
import { Plus, Edit2, Trash2, Search, Power } from 'lucide-react'

interface ProductSummary {
  id: number
  name: string
}

interface BF {
  id: number
  name: string
  starts_at: string
  ends_at: string
  products: { product_id: number; rental_price: number | null; sale_price: number | null }[]
}

const translations = {
  fr: {
    title: 'Gestion Black Friday',
    description: 'Créer et gérer les promotions Black Friday',
    eventStatus: 'Statut de la page',
    eventOn: 'Activée',
    eventOff: 'Désactivée',
    add: 'Ajouter Black Friday',
    search: 'Rechercher...',
    name: 'Nom',
    startsAt: 'Début',
    endsAt: 'Fin',
    assignProducts: 'Produits et prix',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    loadError: 'Impossible de charger les promotions',
    saveError: 'Erreur lors de la sauvegarde',
    deleteError: 'Impossible de supprimer',
  },
  ar: {
    title: 'إدارة بلاك فرايدي',
    description: 'إنشاء وإدارة عروض بلاك فرايدي',
    eventStatus: 'حالة الصفحة',
    eventOn: 'مفعلة',
    eventOff: 'معطلة',
    add: 'إضافة بلاك فرايدي',
    search: 'بحث...',
    name: 'الاسم',
    startsAt: 'البدء',
    endsAt: 'الانتهاء',
    assignProducts: 'المنتجات والأسعار',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    loadError: 'تعذر تحميل العروض',
    saveError: 'خطأ عند الحفظ',
    deleteError: 'تعذر الحذف',
  },
}

export default function BlackFridayPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [items, setItems] = useState<BF[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<BF | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    starts_at: '',
    ends_at: '',
    products: [] as { product_id: number; rental_price: number | null; sale_price: number | null; selected?: boolean }[],
  })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchIsActive = async () => {
    try {
      const res = await fetch(`${API_V1_URL}/event-settings/black_friday`)
      if (res.ok) {
        const data = await res.json()
        setIsActive(data.is_active)
      }
    } catch (e) {
      console.error("Failed to fetch event status", e)
    }
  }

  const toggleIsActive = async (val: boolean) => {
    const token = getAuthToken()
    if (!token) return
    try {
      const res = await fetch(`${API_V1_URL}/event-settings/black_friday`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: val })
      })
      if (res.ok) {
        setIsActive(val)
      }
    } catch (e) {
      console.error("Failed to update event status", e)
    }
  }

  const fetchItems = async () => {
    const token = getAuthToken()
    if (!token) return
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch(`${API_V1_URL}/blackfridays`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed')
      const data: BF[] = await res.json()
      setItems(data)
    } catch {
      setApiError(translations[lang].loadError)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    const token = getAuthToken()
    if (!token) return
    const res = await fetch(`${API_V1_URL}/products`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Failed')
    const data: ProductSummary[] = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    const saved = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(saved)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      void (async () => {
        try {
          await Promise.all([fetchItems(), fetchProducts(), fetchIsActive()])
        } catch {
          setApiError(translations[lang].loadError)
        }
      })()
    }
  }, [isHydrated, isLoggedIn])

  const openModal = (item?: BF) => {
    if (item) {
      const mapped = products.map((p) => {
        const found = item.products.find((pp) => pp.product_id === p.id)
        return {
          product_id: p.id,
          rental_price: found ? found.rental_price : null,
          sale_price: found ? found.sale_price : null,
          selected: !!found,
        }
      })
      setEditing(item)
      setFormData({ name: item.name, starts_at: toLocalInput(item.starts_at), ends_at: toLocalInput(item.ends_at), products: mapped })
    } else {
      setEditing(null)
      setFormData({ name: '', starts_at: '', ends_at: '', products: products.map((p) => ({ product_id: p.id, rental_price: null, sale_price: null, selected: false })) })
    }
    setIsModalOpen(true)
  }

  const toLocalInput = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const min = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditing(null)
    setApiError('')
  }

  const handleToggle = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.product_id === productId ? { ...p, selected: !p.selected } : p)),
    }))
  }

  const handlePriceChange = (productId: number, field: 'rental_price' | 'sale_price', value: string) => {
    const num = value === '' ? null : Number(value)
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.product_id === productId ? { ...p, [field]: num } : p)),
    }))
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) return
    setApiError('')
    const payload = {
      name: formData.name.trim(),
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
      products: formData.products.filter((p) => p.selected).map((p) => ({ product_id: p.product_id, rental_price: p.rental_price, sale_price: p.sale_price })),
    }

    try {
      const res = await fetch(editing ? `${API_V1_URL}/blackfridays/${editing.id}` : `${API_V1_URL}/blackfridays`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      await fetchItems()
      closeModal()
    } catch {
      setApiError(translations[lang].saveError)
    }
  }

  const handleDelete = async (id: number) => {
    const token = getAuthToken()
    if (!token) return
    if (!confirm('Confirm delete?')) return
    try {
      const res = await fetch(`${API_V1_URL}/blackfridays/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed')
      await fetchItems()
    } catch {
      setApiError(translations[lang].deleteError)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  if (!isHydrated) return null
  if (!isLoggedIn) return <LoginPage />

  const t = translations[lang]

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} lang={lang} />
      <main className="flex-1 lg:ml-0">
        <AdminHeader title={t.title} description={t.description} lang={lang} onLanguageChange={(l) => { setLang(l); localStorage.setItem('language', l) }} />
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <Input placeholder={t.search} className="pl-10 bg-card border-border" />
            </div>

            <div className="flex items-center gap-4 bg-card border border-border p-2 px-4 rounded-md">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.eventStatus}</span>
                <span className={`text-xs font-bold ${isActive ? 'text-green-500' : 'text-destructive'}`}>
                  {isActive ? t.eventOn : t.eventOff}
                </span>
              </div>
              <Switch checked={isActive} onCheckedChange={toggleIsActive} />
            </div>

            <Button onClick={() => openModal()} className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"><Plus size={20} />{t.add}</Button>
          </div>

          {apiError && <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{apiError}</div>}

          {loading ? (
            <Card className="bg-card border-border p-12 text-center"><p className="text-muted-foreground">Loading...</p></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => (
                <Card key={it.id} className="bg-card border-border p-6 hover:border-accent transition">
                  <h3 className="text-xl font-bold text-foreground mb-1">{it.name}</h3>
                  <p className="text-muted-foreground text-sm">{new Date(it.starts_at).toLocaleString()} → {new Date(it.ends_at).toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs mb-4">{t.assignProducts}: {it.products.length}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openModal(it)} className="flex-1 text-accent hover:bg-accent/10"><Edit2 size={16} className="mr-1" />{t.edit}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(it.id)} className="flex-1 text-destructive hover:bg-destructive/10"><Trash2 size={16} className="mr-1" />{t.delete}</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">{editing ? 'Modifier' : 'Nouveau'} - {t.title}</h2>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.name}</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-input border-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t.startsAt}</label>
                  <Input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className="bg-input border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t.endsAt}</label>
                  <Input type="datetime-local" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} className="bg-input border-border" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.assignProducts}</label>
                <div className="space-y-2 rounded border border-border p-3 max-h-60 overflow-y-auto">
                  {formData.products.map((p) => (
                    <div key={p.product_id} className="flex items-center gap-3">
                      <input type="checkbox" checked={!!p.selected} onChange={() => handleToggle(p.product_id)} />
                      <div className="flex-1 text-sm text-foreground">{products.find((x) => x.id === p.product_id)?.name}</div>
                      <Input placeholder="Prix location" type="number" value={p.rental_price ?? ''} onChange={(e) => handlePriceChange(p.product_id, 'rental_price', e.target.value)} className="w-32" />
                      <Input placeholder="Prix vente" type="number" value={p.sale_price ?? ''} onChange={(e) => handlePriceChange(p.product_id, 'sale_price', e.target.value)} className="w-32" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={closeModal} variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary">{t.cancel}</Button>
                <Button onClick={handleSave} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">{t.save}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

