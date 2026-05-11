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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit2, Trash2, Search, X, Boxes } from 'lucide-react'

interface PackComponent {
  id?: number
  type: 'product' | 'category' | 'collection'
  product_id?: number | null
  category_id?: number | null
  collection_id?: number | null
  quantity: number
}

interface Pack {
  id: number
  name: string
  description: string | null
  image_url: string | null
  price: number
  is_active: boolean
  components: PackComponent[]
}

interface Entity {
  id: number
  name: string
}

const translations = {
  fr: {
    packs: 'Gestion des Packs',
    description: 'Créez et gérez vos offres groupées (Packs)',
    addPack: 'Ajouter un Pack',
    search: 'Rechercher...',
    name: 'Nom du Pack',
    desc: 'Description',
    price: 'Prix (TND)',
    imageUrl: 'URL de l\'image',
    isActive: 'Actif',
    components: 'Composants du Pack',
    addComponent: 'Ajouter un composant',
    type: 'Type',
    selectItem: 'Sélectionner l\'élément',
    quantity: 'Quantité à choisir',
    actions: 'Actions',
    edit: 'Modifier',
    delete: 'Supprimer',
    noPacks: 'Aucun pack trouvé',
    saveError: 'Erreur lors de la sauvegarde',
    loadError: 'Erreur lors du chargement',
    deleteError: 'Erreur lors de la suppression',
    product: 'Produit spécifique',
    category: 'Catégorie complète',
    collection: 'Collection complète',
  },
  ar: {
    packs: 'إدارة الباقات',
    description: 'إنشاء وإدارة العروض المجمعة (الباقات)',
    addPack: 'إضافة باقة',
    search: 'بحث...',
    name: 'اسم الباقة',
    desc: 'الوصف',
    price: 'السعر (د.ت)',
    imageUrl: 'رابط الصورة',
    isActive: 'نشط',
    components: 'مكونات الباقة',
    addComponent: 'إضافة مكون',
    type: 'النوع',
    selectItem: 'اختر العنصر',
    quantity: 'الكمية المختارة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    noPacks: 'لم يتم العثور على باقات',
    saveError: 'خطأ أثناء الحفظ',
    loadError: 'خطأ أثناء التحميل',
    deleteError: 'خطأ أثناء الحذف',
    product: 'منتج معين',
    category: 'فئة كاملة',
    collection: 'مجموعة كاملة',
  },
}

export default function PacksPage() {
  const { isLoggedIn, logout } = useAuth()
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const [isHydrated, setIsHydrated] = useState(false)
  const [packs, setPacks] = useState<Pack[]>([])
  const [products, setProducts] = useState<Entity[]>([])
  const [categories, setCategories] = useState<Entity[]>([])
  const [collections, setCollections] = useState<Entity[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<Pack | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    price: 0,
    is_active: true,
    components: [] as PackComponent[]
  })

  const getAuthToken = () => localStorage.getItem('admin_token')

  const fetchData = async () => {
    const token = getAuthToken()
    if (!token) return

    setLoading(true)
    setApiError('')
    try {
      const [pRes, prodRes, catRes, collRes] = await Promise.all([
        fetch(`${API_V1_URL}/packs`),
        fetch(`${API_V1_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_V1_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_V1_URL}/collections`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (!pRes.ok || !prodRes.ok || !catRes.ok || !collRes.ok) throw new Error('Failed to fetch data')

      setPacks(await pRes.json())
      setProducts(await prodRes.json())
      setCategories(await catRes.json())
      setCollections(await collRes.json())
    } catch {
      setApiError(lang === 'fr' ? translations.fr.loadError : translations.ar.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedLang = (localStorage.getItem('language') as 'fr' | 'ar') || 'fr'
    setLang(savedLang)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      void fetchData()
    }
  }, [isHydrated, isLoggedIn])

  const handleLanguageChange = (newLang: 'fr' | 'ar') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const filteredPacks = packs.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (pack?: Pack) => {
    if (pack) {
      setEditingPack(pack)
      setFormData({
        name: pack.name,
        description: pack.description || '',
        image_url: pack.image_url || '',
        price: pack.price,
        is_active: pack.is_active,
        components: [...pack.components]
      })
    } else {
      setEditingPack(null)
      setFormData({
        name: '',
        description: '',
        image_url: '',
        price: 0,
        is_active: true,
        components: []
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPack(null)
    setApiError('')
  }

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [...formData.components, { type: 'product', quantity: 1, product_id: null }]
    })
  }

  const removeComponent = (index: number) => {
    const newComps = [...formData.components]
    newComps.splice(index, 1)
    setFormData({ ...formData, components: newComps })
  }

  const updateComponent = (index: number, field: keyof PackComponent, value: any) => {
    const newComps = [...formData.components]
    newComps[index] = { ...newComps[index], [field]: value }
    
    // Clear other IDs when type changes
    if (field === 'type') {
      newComps[index].product_id = null
      newComps[index].category_id = null
      newComps[index].collection_id = null
    }
    
    setFormData({ ...formData, components: newComps })
  }

  const handleSave = async () => {
    const token = getAuthToken()
    if (!token) return

    setSaving(true)
    setApiError('')

    try {
      const response = await fetch(
        editingPack ? `${API_V1_URL}/packs/${editingPack.id}` : `${API_V1_URL}/packs`,
        {
          method: editingPack ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error('Failed to save pack')

      await fetchData()
      closeModal()
    } catch {
      setApiError(lang === 'fr' ? translations.fr.saveError : translations.ar.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const token = getAuthToken()
    if (!token) return

    if (confirm(lang === 'fr' ? 'Confirmer la suppression ?' : 'تأكيد الحذف؟')) {
      try {
        const response = await fetch(`${API_V1_URL}/packs/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('Failed to delete')
        await fetchData()
      } catch {
        setApiError(lang === 'fr' ? translations.fr.deleteError : translations.ar.deleteError)
      }
    }
  }

  const handleToggleState = async (pack: Pack) => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`${API_V1_URL}/packs/${pack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !pack.is_active }),
      })
      if (!response.ok) throw new Error('Failed to toggle')
      await fetchData()
    } catch {
      setApiError(lang === 'fr' ? 'Erreur de mise à jour' : 'خطأ في التحديث')
    }
  }

  if (!isHydrated) return null
  if (!isLoggedIn) return <LoginPage />

  const t = translations[lang]

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AdminSidebar onLogout={handleLogout} lang={lang} />

      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <AdminHeader
          title={t.packs}
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
              {t.addPack}
            </Button>
          </div>

          {apiError && (
            <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          {loading ? (
            <div className="text-center p-12 text-muted-foreground">Chargement...</div>
          ) : filteredPacks.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">{t.noPacks}</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPacks.map((pack) => (
                <Card key={pack.id} className="bg-card border-border overflow-hidden group">
                  <div className="aspect-video relative bg-muted">
                    {pack.image_url ? (
                      <img src={pack.image_url} alt={pack.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Boxes size={48} className="text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Switch
                        checked={pack.is_active}
                        onCheckedChange={() => handleToggleState(pack)}
                        className="data-[state=checked]:bg-accent"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-foreground">{pack.name}</h3>
                      <span className="text-accent font-bold">{pack.price} TND</span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {pack.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      {pack.components.length} composants
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(pack)}
                        className="flex-1 text-accent hover:bg-accent/10"
                      >
                        <Edit2 size={16} className="mr-1" />
                        {t.edit}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pack.id)}
                        className="flex-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} className="mr-1" />
                        {t.delete}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="bg-card border-border max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {editingPack ? (lang === 'fr' ? 'Modifier Pack' : 'تعديل الباقة') : (lang === 'fr' ? 'Nouveau Pack' : 'باقة جديدة')}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.name}</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.price}</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.imageUrl}</label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-7">
                    <label className="text-sm font-medium">{t.isActive}</label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t.desc}</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50 border-border h-24"
                />
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{t.components}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addComponent}
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    <Plus size={16} className="mr-1" />
                    {t.addComponent}
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.components.map((comp, idx) => (
                    <Card key={idx} className="p-4 bg-secondary/30 border-border relative">
                      <button
                        onClick={() => removeComponent(idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 shadow-sm"
                      >
                        <X size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-1 block">{t.type}</label>
                          <Select
                            value={comp.type}
                            onValueChange={(val) => updateComponent(idx, 'type', val)}
                          >
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">{t.product}</SelectItem>
                              <SelectItem value="category">{t.category}</SelectItem>
                              <SelectItem value="collection">{t.collection}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-medium mb-1 block">{t.selectItem}</label>
                          <Select
                            value={String(comp.product_id || comp.category_id || comp.collection_id || '')}
                            onValueChange={(val) => {
                              const id = parseInt(val)
                              if (comp.type === 'product') updateComponent(idx, 'product_id', id)
                              else if (comp.type === 'category') updateComponent(idx, 'category_id', id)
                              else if (comp.type === 'collection') updateComponent(idx, 'collection_id', id)
                            }}
                          >
                            <SelectTrigger className="bg-background border-border text-xs truncate">
                              <SelectValue placeholder={t.selectItem} />
                            </SelectTrigger>
                            <SelectContent>
                              {comp.type === 'product' && products.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                              ))}
                              {comp.type === 'category' && categories.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                              ))}
                              {comp.type === 'collection' && collections.map(coll => (
                                <SelectItem key={coll.id} value={String(coll.id)}>{coll.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-medium mb-1 block">{t.quantity}</label>
                          <Input
                            type="number"
                            min="1"
                            value={comp.quantity}
                            onChange={(e) => updateComponent(idx, 'quantity', parseInt(e.target.value))}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 sticky bottom-0 bg-card pb-2">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || formData.components.length === 0}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20"
                >
                  {saving ? '...' : (lang === 'fr' ? 'Enregistrer le Pack' : 'حفظ الباقة')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
