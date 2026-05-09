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
}

interface SubCategory {
  id: number
  name: string
  slug: string
  category_ids: number[]
  product_ids: number[]
}

interface ProductSummary {
  id: number
  name: string
}

const translations = {
  fr: {
    subCategories: 'Gestion des Sous-catégories',
    description: 'Organisez vos sous-catégories',
    addSubCategory: 'Ajouter une Sous-catégorie',
    search: 'Rechercher...',
    name: 'Nom',
    category: 'Catégorie',
    slug: 'Slug',
    order: 'Ordre',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noSubCategories: 'Aucune sous-catégorie',
    linkedCategories: 'Catégories liées',
    linkedProducts: 'Produits liés',
    assignProducts: 'Assigner Produits',
    saveError: 'Impossible de sauvegarder la sous-catégorie',
    loadError: 'Impossible de charger les sous-catégories',
    deleteError: 'Impossible de supprimer la sous-catégorie',
  },
  ar: {
    subCategories: 'إدارة الفئات الفرعية',
    description: 'تنظيم الفئات الفرعية الخاصة بك',
    addSubCategory: 'إضافة فئة فرعية',
    search: 'بحث...',
    name: 'الاسم',
    category: 'الفئة',
    slug: 'Slug',
    order: 'الترتيب',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    noSubCategories: 'لا توجد فئات فرعية',
    linkedCategories: 'الفئات المرتبطة',
    linkedProducts: 'المنتجات المرتبطة',
    assignProducts: 'ربط المنتجات',
    saveError: 'تعذر حفظ الفئة الفرعية',
    loadError: 'تعذر تحميل الفئات الفرعية',
    deleteError: 'تعذر حذف الفئة الفرعية',
  },
}

export default function SubCategoriesPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_ids: [] as number[],
    product_ids: [] as number[],
  })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchCategories = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }
    const response = await fetch(`${API_V1_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    const data: Category[] = await response.json()
    setCategories(data)
  }

  const fetchSubCategories = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setLoadingSubcategories(true)
    setApiError('')
    try {
      const response = await fetch(`${API_V1_URL}/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories')
      }
      const data: SubCategory[] = await response.json()
      setSubCategories(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoadingSubcategories(false)
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
    if (!isHydrated || !isLoggedIn) {
      return
    }

    void (async () => {
      try {
        await Promise.all([fetchCategories(), fetchSubCategories(), fetchProducts()])
      } catch {
        setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
      }
    })()
  }, [isHydrated, isLoggedIn])

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const getCategoryNames = (categoryIds: number[]) => {
    return categories
      .filter((category) => categoryIds.includes(category.id))
      .map((category) => category.name)
      .join(', ')
  }

  const filteredSubCategories = subCategories.filter((sc) =>
    sc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (subCategory?: SubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory)
      setFormData({
        name: subCategory.name,
        slug: subCategory.slug,
        category_ids: subCategory.category_ids,
        product_ids: subCategory.product_ids,
      })
    } else {
      setEditingSubCategory(null)
      setFormData({ name: '', slug: '', category_ids: [], product_ids: [] })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSubCategory(null)
    setFormData({ name: '', slug: '', category_ids: [], product_ids: [] })
    setApiError('')
  }

  const handleCategoryToggle = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }))
  }

  const handleProductToggle = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }))
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
        category_ids: formData.category_ids,
        product_ids: formData.product_ids,
      }
      const response = await fetch(
        editingSubCategory
          ? `${API_V1_URL}/subcategories/${editingSubCategory.id}`
          : `${API_V1_URL}/subcategories`,
        {
          method: editingSubCategory ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save subcategory')
      }

      await fetchSubCategories()
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
        const response = await fetch(`${API_V1_URL}/subcategories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error('Failed to delete subcategory')
        }
        await fetchSubCategories()
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
          title={t.subCategories}
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
              {t.addSubCategory}
            </Button>
          </div>

          {apiError && (
            <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {loadingSubcategories ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : filteredSubCategories.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">{t.noSubCategories}</p>
            </Card>
          ) : (
            <Card className="bg-card border-border p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.name}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.category}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.slug}
                      </th>
                      <th className="text-center py-3 px-4 text-foreground font-semibold">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubCategories.map((subCategory) => (
                      <tr
                        key={subCategory.id}
                        className="border-b border-border hover:bg-secondary/50 transition"
                      >
                        <td className="py-4 px-4 text-foreground font-medium">
                          {subCategory.name}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-accent/20 text-accent">
                            {getCategoryNames(subCategory.category_ids) || '-'}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.linkedCategories}: {subCategory.category_ids.length}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.linkedProducts}: {subCategory.product_ids.length}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {subCategory.slug}
                        </td>
                        <td className="py-4 px-4 flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(subCategory)}
                            className="text-accent hover:bg-accent/10"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subCategory.id)}
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
              {editingSubCategory
                ? lang === 'fr'
                  ? 'Modifier Sous-catégorie'
                  : 'تعديل الفئة الفرعية'
                : lang === 'fr'
                ? 'Nouvelle Sous-catégorie'
                : 'فئة فرعية جديدة'}
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.category}
                </label>
                <div className="space-y-2 rounded border border-border p-3 max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

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
