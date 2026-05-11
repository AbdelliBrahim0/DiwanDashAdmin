'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Package,
  ShoppingBag,
  Layers,
  Grid,
  Tag,
  Zap,
  Flame,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
  Users,
  Boxes,
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void;
  lang: 'fr' | 'ar';
}

export function AdminSidebar({ onLogout, lang }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  const menuItems = [
    {
      name: lang === 'fr' ? 'Accueil' : 'الرئيسية',
      path: '/admin',
      icon: Home,
    },
    {
      name: lang === 'fr' ? 'Produits' : 'المنتجات',
      path: '/admin/products',
      icon: Package,
    },
    {
      name: lang === 'fr' ? 'Commandes' : 'الطلبات',
      path: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      name: lang === 'fr' ? 'Catégories' : 'الفئات',
      path: '/admin/categories',
      icon: Layers,
    },
    {
      name: lang === 'fr' ? 'Sous-catégories' : 'الفئات الفرعية',
      path: '/admin/subcategories',
      icon: Grid,
    },
    {
      name: lang === 'fr' ? 'Collections' : 'المجموعات',
      path: '/admin/collections',
      icon: Tag,
    },
    {
      name: lang === 'fr' ? 'Utilisateurs' : 'المستخدمين',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: lang === 'fr' ? 'Codes Promo' : 'أكواد الخصم',
      path: '/admin/discounts',
      icon: Zap,
    },
    {
      name: lang === 'fr' ? 'Black Friday' : 'الجمعة السوداء',
      path: '/admin/black-friday',
      icon: Flame,
    },
    {
      name: lang === 'fr' ? 'Happy Hour' : 'ساعة السعادة',
      path: '/admin/happy-hour',
      icon: Settings,
    },
    {
      name: lang === 'fr' ? 'Packs' : 'الباقات',
      path: '/admin/packs',
      icon: Boxes,
    },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary rounded-lg text-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary to-yellow-600 rounded flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg">
            د
          </div>
          {isOpen && (
            <div>
              <div className="font-bold text-sidebar-primary">DIWAN</div>
              <div className="text-xs text-sidebar-accent">Admin</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 text-sidebar-foreground hover:bg-sidebar-accent/10 justify-center lg:justify-start"
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm">{lang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}</span>}
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
