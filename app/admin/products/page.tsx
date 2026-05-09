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

interface AdminProduct {
  id: number
  name: string
  rental_price: number
  sale_price: number
  description: string
  sizes: string[]
  img_url: string
  img_url2: string | null
  is_available: boolean
  category_ids: number[]
  subcategory_ids: number[]
  collection_ids: number[]
}

interface AdminCategory {
  id: number
  name: string
}

interface AdminSubCategory {
  id: number
  name: string
}

interface AdminCollection {
  id: number
  name: string
}

interface ProductFormState {
  name: string
  rental_price: number
  sale_price: number
  description: string
  sizes_input: string
  img_url: string
  img_url2: string
  is_available: boolean
  category_ids: number[]
  subcategory_ids: number[]
  collection_ids: number[]
}

const translations = {
  fr: {
    products: 'Gestion des Produits',
    description: 'Gérez vos produits location/vente',
    addProduct: 'Ajouter un Produit',
    search: 'Rechercher...',
    name: 'Nom',
    rentalPrice: 'Prix Location',
    salePrice: 'Prix Vente',
    available: 'Disponible',
    unavailable: 'Indisponible',
    descriptionField: 'Description',
    sizes: 'Tailles (séparées par des virgules)',
    imgUrl: 'Image URL 1',
    imgUrl2: 'Image URL 2',
    categories: 'Catégories',
    subcategories: 'Sous-catégories',
    collections: 'Collections',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noProducts: 'Aucun produit',
    loadError: 'Impossible de charger les produits',
    saveError: 'Impossible de sauvegarder le produit',
    deleteError: 'Impossible de supprimer le produit',
    cancel: 'Annuler',
    save: 'Enregistrer',
    newProduct: 'Nouveau Produit',
    editProduct: 'Modifier Produit',
  },
  ar: {
    products: 'إدارة المنتجات',
    description: 'إدارة منتجات الكراء والبيع',
    addProduct: 'إضافة منتج',
    search: 'بحث...',
    name: 'الاسم',
    rentalPrice: 'سعر الكراء',
    salePrice: 'سعر البيع',
    available: 'متوفر',
    unavailable: 'غير متوفر',
    descriptionField: 'الوصف',
    sizes: 'المقاسات (مفصولة بفواصل)',
    imgUrl: 'رابط الصورة 1',
    imgUrl2: 'رابط الصورة 2',
    categories: 'الفئات',
    subcategories: 'الفئات الفرعية',
    collections: 'المجموعات',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    noProducts: 'لا توجد منتجات',
    loadError: 'تعذر تحميل المنتجات',
    saveError: 'تعذر حفظ المنتج',
    deleteError: 'تعذر حذف المنتج',
    cancel: 'إلغاء',
    save: 'حفظ',
    newProduct: 'منتج جديد',
    editProduct: 'تعديل المنتج',
  },
}

export default function ProductsPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [subcategories, setSubcategories] = useState<AdminSubCategory[]>([])
  const [collections, setCollections] = useState<AdminCollection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    rental_price: 0,
    sale_price: 0,
    description: '',
    sizes_input: '',
    img_url: '',
    img_url2: '',
    is_available: true,
    category_ids: [],
    subcategory_ids: [],
    collection_ids: [],
  })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchProducts = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setLoadingProducts(true)
    setApiError('')

    try {
      const response = await fetch(`${API_V1_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data: AdminProduct[] = await response.json()
      setProducts(data)
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategoriesSubcategoriesAndCollections = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }
 
    const [categoriesResponse, subcategoriesResponse, collectionsResponse] = await Promise.all([
      fetch(`${API_V1_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_V1_URL}/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_V1_URL}/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
 
    if (!categoriesResponse.ok || !subcategoriesResponse.ok || !collectionsResponse.ok) {
      throw new Error('Failed to fetch relations')
    }
 
    const categoriesData: AdminCategory[] = await categoriesResponse.json()
    const subcategoriesData: AdminSubCategory[] = await subcategoriesResponse.json()
    const collectionsData: AdminCollection[] = await collectionsResponse.json()
 
    setCategories(categoriesData)
    setSubcategories(subcategoriesData)
    setCollections(collectionsData)
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
          await Promise.all([fetchProducts(), fetchCategoriesSubcategoriesAndCollections()])
        } catch {
          setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
        }
      })()
    }
  }, [isHydrated, isLoggedIn])

  const handleCategoryToggle = (categoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }))
  }

  const handleSubcategoryToggle = (subcategoryId: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategory_ids: prev.subcategory_ids.includes(subcategoryId)
        ? prev.subcategory_ids.filter((id) => id !== subcategoryId)
        : [...prev.subcategory_ids, subcategoryId],
    }))
  }

  const handleCollectionToggle = (collectionId: number) => {
    setFormData((prev) => ({
      ...prev,
      collection_ids: prev.collection_ids.includes(collectionId)
        ? prev.collection_ids.filter((id) => id !== collectionId)
        : [...prev.collection_ids, collectionId],
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        rental_price: product.rental_price,
        sale_price: product.sale_price,
        description: product.description,
        sizes_input: product.sizes.join(', '),
        img_url: product.img_url,
        img_url2: product.img_url2 ?? '',
        is_available: product.is_available,
        category_ids: product.category_ids,
        subcategory_ids: product.subcategory_ids,
        collection_ids: product.collection_ids,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        rental_price: 0,
        sale_price: 0,
        description: '',
        sizes_input: '',
        img_url: '',
        img_url2: '',
        is_available: true,
        category_ids: [],
        subcategory_ids: [],
        collection_ids: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setApiError('')
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    setSaving(true)
    setApiError('')

    const payload = {
      name: formData.name.trim(),
      rental_price: Number(formData.rental_price),
      sale_price: Number(formData.sale_price),
      description: formData.description.trim(),
      sizes: formData.sizes_input
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean),
      img_url: formData.img_url.trim(),
      img_url2: formData.img_url2.trim() || null,
      is_available: formData.is_available,
      category_ids: formData.category_ids,
      subcategory_ids: formData.subcategory_ids,
      collection_ids: formData.collection_ids,
    }

    try {
      const response = await fetch(
        editingProduct ? `${API_V1_URL}/products/${editingProduct.id}` : `${API_V1_URL}/products`,
        {
          method: editingProduct ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      await fetchProducts()
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
        const response = await fetch(`${API_V1_URL}/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete product')
        }

        await fetchProducts()
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
          title={t.products}
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
              {t.addProduct}
            </Button>
          </div>

          {/* Products Table */}
          <Card className="bg-card border-border p-6">
            {apiError && (
              <div className="mb-4 rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {apiError}
              </div>
            )}

            {loadingProducts ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.noProducts}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.name}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.rentalPrice}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.salePrice}
                      </th>
                      <th className="text-left py-3 px-4 text-foreground font-semibold">
                        {t.available}
                      </th>
                      <th className="text-center py-3 px-4 text-foreground font-semibold">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border hover:bg-secondary/50 transition"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-foreground font-medium">
                              {product.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {product.description.substring(0, 60)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-accent font-semibold">
                          {product.rental_price.toFixed(2)} TND
                        </td>
                        <td className="py-4 px-4 text-accent font-semibold">
                          {product.sale_price.toFixed(2)} TND
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            product.is_available
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {product.is_available ? t.available : t.unavailable}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t.categories}: {product.category_ids.length} | {t.subcategories}: {product.subcategory_ids.length} | {t.collections}: {product.collection_ids.length}
                          </p>
                        </td>
                        <td className="py-4 px-4 flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(product)}
                            className="text-accent hover:bg-accent/10"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
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
            )}
          </Card>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {editingProduct
                ? t.editProduct
                : t.newProduct}
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
                  {t.rentalPrice}
                </label>
                <Input
                  type="number"
                  value={formData.rental_price}
                  onChange={(e) =>
                    setFormData({ ...formData, rental_price: Number(e.target.value) || 0 })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.salePrice}
                </label>
                <Input
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_price: Number(e.target.value) || 0 })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.descriptionField}
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.sizes}
                </label>
                <Input
                  value={formData.sizes_input}
                  onChange={(e) =>
                    setFormData({ ...formData, sizes_input: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.imgUrl}
                </label>
                <Input
                  value={formData.img_url}
                  onChange={(e) =>
                    setFormData({ ...formData, img_url: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.imgUrl2}
                </label>
                <Input
                  value={formData.img_url2}
                  onChange={(e) =>
                    setFormData({ ...formData, img_url2: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.categories}
                </label>
                <div className="space-y-2 rounded border border-border p-3 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.subcategories}
                </label>
                <div className="space-y-2 rounded border border-border p-3 max-h-32 overflow-y-auto">
                  {subcategories.map((subcategory) => (
                    <label key={subcategory.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.subcategory_ids.includes(subcategory.id)}
                        onChange={() => handleSubcategoryToggle(subcategory.id)}
                      />
                      {subcategory.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t.collections}
                </label>
                <div className="space-y-2 rounded border border-border p-3 max-h-32 overflow-y-auto">
                  {collections.map((collection) => (
                    <label key={collection.id} className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.collection_ids.includes(collection.id)}
                        onChange={() => handleCollectionToggle(collection.id)}
                      />
                      {collection.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_available"
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                />
                <label htmlFor="is_available" className="text-sm text-foreground">
                  {t.available}
                </label>
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
