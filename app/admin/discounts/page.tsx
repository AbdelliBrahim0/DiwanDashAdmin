'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/login-page'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminHeader } from '@/components/admin-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockDiscounts, Discount } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Search, Copy, CheckCircle, XCircle, RefreshCcw } from 'lucide-react'
import { API_V1_URL } from '@/lib/backend'

const translations = {
  fr: {
    discounts: 'Codes Promo',
    description: 'Gérez vos codes de réduction',
    addDiscount: 'Ajouter un Code',
    search: 'Rechercher...',
    code: 'Code',
    type: 'Type',
    value: 'Valeur',
    maxUses: 'Utilisations Max',
    used: 'Utilisé',
    status: 'Statut',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    copy: 'Copier',
    noDiscounts: 'Aucun code',
    percentage: 'Pourcentage',
    fixed: 'Montant Fixe',
    active: 'Actif',
    inactive: 'Inactif',
  },
  ar: {
    discounts: 'أكواد الخصم',
    description: 'إدارة أكواد الخصم الخاصة بك',
    addDiscount: 'إضافة كود',
    search: 'بحث...',
    code: 'الكود',
    type: 'النوع',
    value: 'القيمة',
    maxUses: 'الاستخدامات القصوى',
    used: 'المستخدمة',
    status: 'الحالة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    copy: 'نسخ',
    noDiscounts: 'لا توجد أكواد',
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    active: 'نشط',
    inactive: 'غير نشط',
  },
}

export default function DiscountsPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [formData, setFormData] = useState<Partial<Discount>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setLoading(true)
    try {
      const res = await fetch(`${API_V1_URL}/promo-codes/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      // Map is_active to active for the frontend
      setDiscounts(data.map((d: any) => ({
        ...d,
        active: d.is_active,
        startDate: d.start_date,
        endDate: d.end_date.split('T')[0],
        maxUses: d.max_uses,
        usedCount: d.used_count
      })))
    } catch (err) {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const filteredDiscounts = discounts.filter((d) =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount)
      setFormData(discount)
    } else {
      setEditingDiscount(null)
      setFormData({ type: 'percentage', value: 0 })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDiscount(null)
    setFormData({})
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'DIWAN-'
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code: result })
  }

  const handleSave = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setLoading(true)
    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: formData.value,
        max_uses: formData.maxUses,
        end_date: new Date(formData.endDate || '').toISOString(),
        is_active: formData.active !== false
      }

      let res
      if (editingDiscount) {
        res = await fetch(`${API_V1_URL}/promo-codes/${editingDiscount.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_V1_URL}/promo-codes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Save failed')
      }

      await fetchDiscounts()
      closeModal()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('admin_token')
    if (!token || !confirm(lang === 'fr' ? 'Confirmer la suppression ?' : 'تأكيد الحذف؟')) return

    try {
      const res = await fetch(`${API_V1_URL}/promo-codes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Delete failed')
      setDiscounts(discounts.filter((d) => d.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Code copié !')
  }

  if (!isHydrated) {
    return null
  }

  if (!isLoggedIn) {
    return <LoginPage />
  }

  const t = translations[lang]

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} lang={lang} />

      <main className="flex-1 lg:ml-0">
        <AdminHeader
          title={t.discounts}
          description={t.description}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />

        <div className="p-6 space-y-6">
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
            <Button
              onClick={() => openModal()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
            >
              <Plus size={20} />
              {t.addDiscount}
            </Button>
          </div>

          {filteredDiscounts.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">{t.noDiscounts}</p>
            </Card>
          ) : (
            <Card className="bg-card border-border p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.code}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.type}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.value}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.used}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.status}
                      </th>
                      <th className="text-center py-3 px-4 text-foreground font-semibold">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDiscounts.map((discount) => (
                      <tr
                        key={discount.id}
                        className="border-b border-border hover:bg-secondary/50 transition"
                      >
                        <td className="py-4 px-4 text-foreground font-mono font-bold">
                          {discount.code}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm px-2 py-1 rounded bg-accent/20 text-accent">
                            {discount.type === 'percentage' ? t.percentage : t.fixed}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-foreground font-semibold">
                          {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {discount.usedCount} / {discount.maxUses}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-sm px-2 py-1 rounded font-semibold ${
                            discount.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {discount.active ? t.active : t.inactive}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(discount.code)}
                            className="text-accent hover:bg-accent/10"
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(discount)}
                            className="text-accent hover:bg-accent/10"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(discount.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingDiscount
                ? lang === 'fr'
                  ? 'Modifier Code'
                  : 'تعديل الكود'
                : lang === 'fr'
                ? 'Nouveau Code'
                : 'كود جديد'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.code}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="bg-input border-border font-mono flex-1"
                    placeholder="SUMMER20"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateCode}
                    className="border-accent/30 text-accent hover:bg-accent/10 p-2"
                    title="Générer un code"
                  >
                    <RefreshCcw size={18} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.type}
                </label>
                <select
                  value={formData.type || 'percentage'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-foreground"
                >
                  <option value="percentage">{t.percentage}</option>
                  <option value="fixed">{t.fixed}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.value}
                </label>
                <Input
                  type="number"
                  value={formData.value || 0}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  className="bg-input border-border"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.maxUses}
                </label>
                <Input
                  type="number"
                  value={formData.maxUses || 100}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                  className="bg-input border-border"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Expire le
                </label>
                <Input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`flex-1 flex items-center justify-center gap-2 border ${
                    formData.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {formData.active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {formData.active ? t.active : t.inactive}
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {lang === 'fr' ? 'Enregistrer' : 'حفظ'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
