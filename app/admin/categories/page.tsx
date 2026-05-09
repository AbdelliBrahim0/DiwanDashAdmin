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
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  subcategory_ids: number[]
  product_ids: number[]
}

interface ProductSummary {
  id: number
  name: string
}

const translations = {
  fr: {
    categories: 'Gestion des Catégories',
    description: 'Organisez vos catégories de produits',
    addCategory: 'Ajouter une Catégorie',
    search: 'Rechercher...',
    name: 'Nom',
    slug: 'Slug',
    linkedSubcategories: 'Sous-catégories liées',
    linkedProducts: 'Produits liés',
    assignProducts: 'Assigner Produits',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noCategories: 'Aucune catégorie',
    saveError: 'Impossible de sauvegarder la catégorie',
    loadError: 'Impossible de charger les catégories',
    deleteError: 'Impossible de supprimer la catégorie',
  },
  ar: {
    categories: 'إدارة الفئات',
    description: 'تنظيم فئات المنتجات الخاصة بك',
    addCategory: 'إضافة فئة',
    search: 'بحث...',
    name: 'الاسم',
    slug: 'Slug',
    linkedSubcategories: 'الفئات الفرعية المرتبطة',
    linkedProducts: 'المنتجات المرتبطة',
    assignProducts: 'ربط المنتجات',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    noCategories: 'لا توجد فئات',
    saveError: 'تعذر حفظ الفئة',
    loadError: 'تعذر تحميل الفئات',
    deleteError: 'تعذر حذف الفئة',
  },
}

export default function CategoriesPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', product_ids: [] as number[] })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchCategories = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setLoadingCategories(true)
    setApiError('')
    try {
      const response = await fetch(`${API_V1_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data: Category[] = await response.json()
      setCategories(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProducts = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    const response = await fetch(`${API_V1_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    const data: ProductSummary[] = await response.json()
    setProducts(data)
  }

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      void (async () => {
        try {
          await Promise.all([fetchCategories(), fetchProducts()])
        } catch {
          setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
        }
      })()
    }
  }, [isHydrated, isLoggedIn])

  const handleProductToggle = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }))
  }

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name, slug: category.slug, product_ids: category.product_ids })
    } else {
      setEditingCategory(null)
      setFormData({ name: '', slug: '', product_ids: [] })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setApiError('')
    setFormData({ name: '', slug: '', product_ids: [] })
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setSaving(true)
    setApiError('')

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        product_ids: formData.product_ids,
      }
      const response = await fetch(
        editingCategory
          ? `${API_V1_URL}/categories/${editingCategory.id}`
          : `${API_V1_URL}/categories`,
        {
          method: editingCategory ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save category')
      }

      await fetchCategories()
      closeModal()
    } catch {
      setApiError(lang === 'fr' ? translations.fr.saveError : translations.ar.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    if (confirm(lang === 'fr' ? 'Confirmer la suppression ?' : 'تأكيد الحذف؟')) {
      try {
        const response = await fetch(`${API_V1_URL}/categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error('Failed to delete category')
        }
        await fetchCategories()
      } catch {
        setApiError(lang === 'fr' ? translations.fr.deleteError : translations.ar.deleteError)
      }
    }
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
          title={t.categories}
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
            <Button
              onClick={() => openModal()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
            >
              <Plus size={20} />
              {t.addCategory}
            </Button>
          </div>

          {/* Categories Grid */}
          {apiError && (
            <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {loadingCategories ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : filteredCategories.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">{t.noCategories}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-card border-border p-6 hover:border-accent transition"
                >
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.slug}
                  </p>
                  <p className="text-muted-foreground text-xs mb-4">
                    {t.linkedSubcategories}: {category.subcategory_ids.length}
                  </p>
                  <p className="text-muted-foreground text-xs mb-4">
                    {t.linkedProducts}: {category.product_ids.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(category)}
                      className="flex-1 text-accent hover:bg-accent/10"
                    >
                      <Edit2 size={16} className="mr-1" />
                      {t.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} className="mr-1" />
                      {t.delete}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingCategory
                ? lang === 'fr'
                  ? 'Modifier Catégorie'
                  : 'تعديل الفئة'
                : lang === 'fr'
                ? 'Nouvelle Catégorie'
                : 'فئة جديدة'}
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.name}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.slug}
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.assignProducts}
                </label>
                <div className="space-y-2 rounded border border-border p-3 max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.product_ids.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                      />
                      {product.name}
                    </label>
                  ))}
                </div>
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
                  disabled={saving}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {saving ? '...' : (lang === 'fr' ? 'Enregistrer' : 'حفظ')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
