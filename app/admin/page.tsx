'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminHeader } from '@/components/admin-header'
import { Card } from '@/components/ui/card'
import {
  mockCategories,
  mockProducts,
  mockDiscounts,
  mockBlackFriday,
  mockHappyHour,
} from '@/lib/mock-data'
import { API_V1_URL } from '@/lib/backend'
import {
  Package,
  Layers,
  Tag,
  Zap,
  Flame,
  TrendingUp,
  Users,
  ShoppingCart,
} from 'lucide-react'

const translations = {
  fr: {
    dashboard: 'Tableau de Bord',
    welcome: 'Bienvenue dans le dashboard Diwan',
    stats: 'Statistiques',
    products: 'Produits',
    categories: 'Catégories',
    discounts: 'Codes Promo',
    blackfriday: 'Black Friday',
    happyhour: 'Happy Hour',
    totalProducts: 'Produits Total',
    totalCategories: 'Catégories',
    activeDiscounts: 'Codes Actifs',
    revenue: 'Revenu',
    customers: 'Clients',
    orders: 'Commandes',
    growth: 'Croissance',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    welcome: 'مرحبا بك في لوحة تحكم ديوان',
    stats: 'الإحصائيات',
    products: 'المنتجات',
    categories: 'الفئات',
    discounts: 'أكواد الخصم',
    blackfriday: 'الجمعة السوداء',
    happyhour: 'ساعة السعادة',
    totalProducts: 'إجمالي المنتجات',
    totalCategories: 'الفئات',
    activeDiscounts: 'الأكواد النشطة',
    revenue: 'الإيرادات',
    customers: 'العملاء',
    orders: 'الطلبات',
    growth: 'النمو',
  },
}

interface DashboardStats {
  total_users: number
  total_orders: number
  total_products: number
  total_categories: number
  total_revenue: number
  orders_today: number
  revenue_today: number
  active_promo_codes: number
  new_users_today: number
  order_growth: number
  recent_orders: any[]
  recent_products: any[]
}

export default function AdminDashboard() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [statsData, setStatsData] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const res = await fetch(`${API_V1_URL}/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setStatsData(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [])

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  if (!isHydrated) {
    return null
  }

  if (!isLoggedIn) {
    return <LoginPage />
  }

  const t = translations[lang]
  const activeDiscounts = mockDiscounts.filter((d) => d.active).length
  const activeBlackFriday = mockBlackFriday.filter((b) => b.active).length

  const stats = [
    {
      label: t.totalProducts,
      value: statsData?.total_products ?? '...',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t.totalCategories,
      value: statsData?.total_categories ?? '...',
      icon: Layers,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: t.activeDiscounts,
      value: statsData?.active_promo_codes ?? '...',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      label: t.revenue,
      value: `${(statsData?.total_revenue ?? 0).toLocaleString()} TND`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      label: t.customers,
      value: statsData?.total_users ?? '...',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
    },
    {
      label: t.orders,
      value: statsData?.total_orders ?? '...',
      icon: ShoppingCart,
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} lang={lang} />

      <main className="flex-1 lg:ml-0">
        <AdminHeader
          title={t.dashboard}
          description={t.welcome}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card
                  key={stat.label}
                  className="bg-card border-border p-6 hover:border-accent transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                    >
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Package size={20} className="text-accent" />
                  {lang === 'fr' ? 'Derniers Produits' : 'آخر المنتجات'}
                </h3>
              </div>
              <div className="space-y-3">
                {statsData?.recent_products.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded border border-border/50"
                  >
                    <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center">
                      <Package size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium text-sm">
                        {lang === 'fr' ? product.name : product.name_ar}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {Number(product.price).toFixed(2)} TND
                      </p>
                    </div>
                    <span className="text-accent font-semibold text-sm">
                      {product.stock} {lang === 'fr' ? 'en stock' : 'في المخزن'}
                    </span>
                  </div>
                ))}
                {(!statsData?.recent_products || statsData.recent_products.length === 0) && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    {lang === 'fr'
                      ? 'Aucun produit récent'
                      : 'لا توجد منتجات حديثة'}
                  </p>
                )}
              </div>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart size={20} className="text-accent" />
                  {lang === 'fr' ? 'Dernières Commandes' : 'آخر الطلبات'}
                </h3>
              </div>
              <div className="space-y-3">
                {statsData?.recent_orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded border border-border/50"
                  >
                    <div className="w-10 h-10 bg-indigo-500/20 rounded flex items-center justify-center">
                      <ShoppingCart size={20} className="text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(order.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-TN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-semibold text-sm">
                        {order.total_amount.toFixed(2)} TND
                      </p>
                      <span className="text-[10px] uppercase bg-accent/10 text-accent px-2 py-0.5 rounded">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!statsData?.recent_orders || statsData.recent_orders.length === 0) && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    {lang === 'fr'
                      ? 'Aucune commande récente'
                      : 'لا توجد طلبات حديثة'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Ventes Aujourd\'hui' : 'مبيعات اليوم'}
              </h4>
              <p className="text-3xl font-bold text-accent">{(statsData?.revenue_today ?? 0).toLocaleString()} TND</p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? `${statsData?.orders_today ?? 0} commandes aujourd'hui`
                  : `${statsData?.orders_today ?? 0} طلبات اليوم`}
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Nouveaux Clients' : 'عملاء جدد'}
              </h4>
              <p className="text-3xl font-bold text-accent">{statsData?.new_users_today ?? 0}</p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? 'Aujourd\'hui'
                  : 'اليوم'}
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Croissance Commandes' : 'نمو الطلبات'}
              </h4>
              <p className="text-3xl font-bold text-accent">
                {statsData?.order_growth && statsData.order_growth > 0 ? '+' : ''}
                {statsData?.order_growth ?? 0}%
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? 'Par rapport à hier'
                  : 'مقارنة بيوم أمس'}
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
