'use client'

import { useState, useEffect } from 'react'
import { API_V1_URL } from '@/lib/backend'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminHeader } from '@/components/admin-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, User as UserIcon, Mail, Phone, MapPin, Calendar, ShieldAlert, ShieldCheck, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address: string
  is_active: boolean
  created_at: string
}

const translations = {
  fr: {
    users: 'Gestion des Utilisateurs',
    description: 'Consultez la liste des clients inscrits',
    search: 'Rechercher un client...',
    name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    date: 'Inscription',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    noUsers: 'Aucun utilisateur trouvé',
    loadError: 'Impossible de charger les utilisateurs',
    block: 'Bloquer',
    unblock: 'Débloquer',
    confirmBlock: 'Voulez-vous vraiment bloquer cet utilisateur ?',
    confirmUnblock: 'Voulez-vous réactiver cet utilisateur ?',
    prev: 'Précédent',
    next: 'Suivant',
    page: 'Page',
  },
  ar: {
    users: 'إدارة المستخدمين',
    description: 'عرض قائمة العملاء المسجلين',
    search: 'البحث عن عميل...',
    name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    date: 'تاريخ التسجيل',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    noUsers: 'لم يتم العثور على مستخدمين',
    loadError: 'تعذر تحميل المستخدمين',
    block: 'حظر',
    unblock: 'إلغاء الحظر',
    confirmBlock: 'هل أنت متأكد من حظر هذا المستخدم؟',
    confirmUnblock: 'هل تريد إعادة تفعيل هذا المستخدم؟',
    prev: 'السابق',
    next: 'التالي',
    page: 'صفحة',
  },
}

export default function UsersPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [page, setPage] = useState(1)
  const limit = 6

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchUsers = async () => {
    const token = getAuthToken()
    if (!token) return

    setLoading(true)
    setApiError('')
    try {
      const skip = (page - 1) * limit
      const response = await fetch(`${API_V1_URL}/users/?skip=${skip}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data: User[] = await response.json()
      setUsers(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? t.confirmBlock : t.confirmUnblock
    if (!window.confirm(action)) return

    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`${API_V1_URL}/users/${userId}/status?is_active=${!currentStatus}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Toggle failed')
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    } catch {
      alert("Erreur lors de la modification du statut")
    }
  }

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      fetchUsers()
    }
  }, [isHydrated, isLoggedIn, page])

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isHydrated) return null
  if (!isLoggedIn) return <LoginPage />

  const t = translations[lang]

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground">
      <AdminSidebar onLogout={handleLogout} lang={lang} />

      <main className="flex-1 lg:ml-0">
        <AdminHeader
          title={t.users}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 animate-pulse bg-card/50" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">{t.noUsers}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-card border-border p-6 hover:border-sidebar-primary transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-sidebar-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded mt-2 inline-block ${
                        user.is_active ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {user.is_active ? t.active : t.inactive}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail size={16} className="text-sidebar-primary" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone size={16} className="text-sidebar-primary" />
                      <span>{user.phone_number}</span>
                    </div>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin size={16} className="text-sidebar-primary mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{user.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground pt-2 border-t border-border/50">
                      <Calendar size={16} className="text-sidebar-primary" />
                      <span className="text-xs">
                        {new Date(user.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant={user.is_active ? "destructive" : "outline"}
                        className="w-full gap-2 h-9"
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? (
                          <>
                            <ShieldAlert size={16} />
                            {t.block}
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            {t.unblock}
                          </>
                        )}
                      </Button>
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
              disabled={filteredUsers.length < limit || loading}
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
