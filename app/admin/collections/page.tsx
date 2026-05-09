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

interface Collection {
  id: number
  name: string
  name_ar: string | null
  slug: string
  description: string | null
  description_ar: string | null
  image_url: string | null
  order: number
  product_ids: number[]
}

interface ProductSummary {
  id: number
  name: string
}

const translations = {
  fr: {
    collections: 'Gestion des Collections',
    description: 'Organisez vos collections de produits',
    addCollection: 'Ajouter une Collection',
    search: 'Rechercher...',
    name: 'Nom',
    nameAr: 'Nom (Arabe)',
    slug: 'Slug',
    descriptionField: 'Description',
    descriptionAr: 'Description (Arabe)',
    imageUrl: 'Image URL',
    order: 'Ordre',
    linkedProducts: 'Produits liés',
    assignProducts: 'Assigner Produits',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noCollections: 'Aucune collection',
    saveError: 'Impossible de sauvegarder la collection',
    loadError: 'Impossible de charger les collections',
    deleteError: 'Impossible de supprimer la collection',
    cancel: 'Annuler',
    save: 'Enregistrer',
    newCollection: 'Nouvelle Collection',
    editCollection: 'Modifier Collection',
  },
  ar: {
    collections: 'إدارة المجموعات',
    description: 'تنظيم مجموعات المنتجات الخاصة بك',
    addCollection: 'إضافة مجموعة',
    search: 'بحث...',
    name: 'الاسم',
    nameAr: 'الاسم (بالعربية)',
    slug: 'Slug',
    descriptionField: 'الوصف',
    descriptionAr: 'الوصف (بالعربية)',
    imageUrl: 'رابط الصورة',
    order: 'الترتيب',
    linkedProducts: 'المنتجات المرتبطة',
    assignProducts: 'ربط المنتجات',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    noCollections: 'لا توجد مجموعات',
    saveError: 'تعذر حفظ المجموعة',
    loadError: 'تعذر تحميل المجموعات',
    deleteError: 'تعذر حذف المجموعة',
    cancel: 'إلغاء',
    save: 'حفظ',
    newCollection: 'مجموعة جديدة',
    editCollection: 'تعديل المجموعة',
  },
}

export default function CollectionsPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    image_url: '',
    order: 0,
    product_ids: [] as number[],
  })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchCollections = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setLoadingCollections(true)
    setApiError('')
    try {
      const response = await fetch(`${API_V1_URL}/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch collections')
      }
      const data: Collection[] = await response.json()
      setCollections(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoadingCollections(false)
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
          await Promise.all([fetchCollections(), fetchProducts()])
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

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection)
      setFormData({
        name: collection.name,
        name_ar: collection.name_ar || '',
        slug: collection.slug,
        description: collection.description || '',
        description_ar: collection.description_ar || '',
        image_url: collection.image_url || '',
        order: collection.order,
        product_ids: collection.product_ids,
      })
    } else {
      setEditingCollection(null)
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        description_ar: '',
        image_url: '',
        order: 0,
        product_ids: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCollection(null)
    setApiError('')
    setFormData({
      name: '',
      name_ar: '',
      slug: '',
      description: '',
      description_ar: '',
      image_url: '',
      order: 0,
      product_ids: [],
    })
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
        name_ar: formData.name_ar.trim() || null,
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        description_ar: formData.description_ar.trim() || null,
        image_url: formData.image_url.trim() || null,
        order: Number(formData.order),
        product_ids: formData.product_ids,
      }
      const response = await fetch(
        editingCollection
          ? `${API_V1_URL}/collections/${editingCollection.id}`
          : `${API_V1_URL}/collections`,
        {
          method: editingCollection ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save collection')
      }

      await fetchCollections()
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
        const response = await fetch(`${API_V1_URL}/collections/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error('Failed to delete collection')
        }
        await fetchCollections()
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
          title={t.collections}
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
              {t.addCollection}
            </Button>
          </div>

          {/* Collections Grid */}
          {apiError && (
            <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {loadingCollections ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : filteredCollections.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <p className="text-muted-foreground">{t.noCollections}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCollections.map((collection) => (
                <Card
                  key={collection.id}
                  className="bg-card border-border p-6 hover:border-accent transition"
                >
                  {collection.image_url && (
                    <div className="w-full h-32 mb-4 overflow-hidden rounded bg-secondary/50">
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {lang === 'fr' ? collection.name : (collection.name_ar || collection.name)}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {collection.slug}
                  </p>
                  <p className="text-muted-foreground text-xs mb-4 line-clamp-2">
                    {lang === 'fr' ? collection.description : collection.description_ar}
                  </p>
                  <p className="text-muted-foreground text-xs mb-4">
                    {t.linkedProducts}: {collection.product_ids.length} | {t.order}: {collection.order}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(collection)}
                      className="flex-1 text-accent hover:bg-accent/10"
                    >
                      <Edit2 size={16} className="mr-1" />
                      {t.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
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
              {editingCollection
                ? t.editCollection
                : t.newCollection}
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
                  {t.nameAr}
                </label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
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
                  {t.descriptionField}
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.descriptionAr}
                </label>
                <Input
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.imageUrl}
                </label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-input border-border"
                />
                {formData.image_url && (
                  <div className="mt-2 w-full h-20 rounded overflow-hidden border border-border bg-secondary/30">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.order}
                </label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })}
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
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {saving ? '...' : t.save}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
