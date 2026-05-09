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

export default function AdminDashboard() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
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
      value: mockProducts.length,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t.totalCategories,
      value: mockCategories.length,
      icon: Layers,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: t.activeDiscounts,
      value: activeDiscounts,
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      label: t.revenue,
      value: '12,450 TND',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      label: t.customers,
      value: '342',
      icon: Users,
      color: 'from-pink-500 to-pink-600',
    },
    {
      label: t.orders,
      value: '156',
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
                {mockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded"
                  >
                    <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center">
                      <Package size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium text-sm">
                        {lang === 'fr' ? product.name : product.nameAr}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {product.price.toFixed(2)} TND
                      </p>
                    </div>
                    <span className="text-accent font-semibold text-sm">
                      {product.stock} {lang === 'fr' ? 'en stock' : 'في المخزن'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Promotions */}
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Flame size={20} className="text-accent" />
                  {lang === 'fr' ? 'Promotions Actives' : 'العروض النشطة'}
                </h3>
              </div>
              <div className="space-y-3">
                {mockBlackFriday
                  .filter((b) => b.active)
                  .map((promo) => (
                    <div
                      key={promo.id}
                      className="p-3 bg-secondary/30 rounded border border-accent/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {lang === 'fr' ? promo.name : promo.nameAr}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {promo.startDate} → {promo.endDate}
                          </p>
                        </div>
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded text-sm font-bold">
                          -{promo.discount}%
                        </span>
                      </div>
                    </div>
                  ))}
                {activeBlackFriday === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    {lang === 'fr'
                      ? 'Aucune promotion active'
                      : 'لا توجد عروض نشطة'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Total Ventes' : 'إجمالي المبيعات'}
              </h4>
              <p className="text-3xl font-bold text-accent">24,890 TND</p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? '+12% cette semaine'
                  : '+12% هذا الأسبوع'}
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Visiteurs' : 'الزوار'}
              </h4>
              <p className="text-3xl font-bold text-accent">2,458</p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? '+8% ce mois'
                  : '+8% هذا الشهر'}
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20 p-6">
              <h4 className="text-foreground font-bold mb-2">
                {lang === 'fr' ? 'Panier Moyen' : 'متوسط السلة'}
              </h4>
              <p className="text-3xl font-bold text-accent">72.50 TND</p>
              <p className="text-muted-foreground text-sm mt-2">
                {lang === 'fr'
                  ? '+5% depuis hier'
                  : '+5% منذ أمس'}
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
