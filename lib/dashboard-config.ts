/**
 * Diwan Dashboard Configuration
 * Centralized configuration for the admin dashboard
 */

export const dashboardConfig = {
  // Application metadata
  app: {
    name: 'Diwan Admin Dashboard',
    description: 'Admin dashboard for Diwan luxury products management',
    version: '1.0.0',
    author: 'Diwan Team',
  },

  // Authentication config
  auth: {
    defaultEmail: 'admin@diwan.local',
    defaultPassword: 'StrongPassword123!',
    tokenKey: 'admin_token',
    emailKey: 'admin_email',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in ms
  },

  // Theme configuration
  theme: {
    dark: {
      primary: '#d4af37', // Gold
      background: '#0f0f0f', // Deep black
      card: '#1a1a1a',
      border: '#333333',
      text: '#f0f0f0',
      mutedText: '#a0a0a0',
    },
  },

  // Navigation items
  navigation: [
    {
      id: 'dashboard',
      label: { fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
      path: '/admin',
      icon: 'BarChart3',
    },
    {
      id: 'products',
      label: { fr: 'Produits', ar: 'المنتجات' },
      path: '/admin/products',
      icon: 'Package',
    },
    {
      id: 'categories',
      label: { fr: 'Catégories', ar: 'الفئات' },
      path: '/admin/categories',
      icon: 'Layers',
    },
    {
      id: 'subcategories',
      label: { fr: 'Sous-Catégories', ar: 'الفئات الفرعية' },
      path: '/admin/subcategories',
      icon: 'List',
    },
    {
      id: 'collections',
      label: { fr: 'Collections', ar: 'المجموعات' },
      path: '/admin/collections',
      icon: 'Briefcase',
    },
    {
      id: 'discounts',
      label: { fr: 'Codes Promo', ar: 'أكواد الخصم' },
      path: '/admin/discounts',
      icon: 'Zap',
    },
    {
      id: 'blackfriday',
      label: { fr: 'Black Friday', ar: 'الجمعة السوداء' },
      path: '/admin/black-friday',
      icon: 'Flame',
    },
    {
      id: 'happyhour',
      label: { fr: 'Happy Hour', ar: 'ساعة السعادة' },
      path: '/admin/happy-hour',
      icon: 'Clock',
    },
  ],

  // Supported languages
  languages: [
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
  ],

  // Default language
  defaultLanguage: 'fr',

  // Pagination settings
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },

  // Table settings
  tables: {
    striped: true,
    hoverable: true,
    bordered: true,
  },

  // Form settings
  forms: {
    submitButtonText: { fr: 'Enregistrer', ar: 'حفظ' },
    cancelButtonText: { fr: 'Annuler', ar: 'إلغاء' },
    loadingText: { fr: 'Enregistrement...', ar: 'جاري الحفظ...' },
    deleteConfirm: {
      fr: 'Êtes-vous sûr de vouloir supprimer cet élément?',
      ar: 'هل أنت متأكد من حذف هذا العنصر؟',
    },
  },

  // Messages
  messages: {
    success: {
      fr: 'Opération réussie',
      ar: 'تم العملية بنجاح',
    },
    error: {
      fr: 'Une erreur est survenue',
      ar: 'حدث خطأ',
    },
    loginError: {
      fr: 'Email ou mot de passe incorrect',
      ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    },
    deleteSuccess: {
      fr: 'Élément supprimé avec succès',
      ar: 'تم حذف العنصر بنجاح',
    },
    addSuccess: {
      fr: 'Élément ajouté avec succès',
      ar: 'تم إضافة العنصر بنجاح',
    },
    updateSuccess: {
      fr: 'Élément mise à jour avec succès',
      ar: 'تم تحديث العنصر بنجاح',
    },
  },

  // Features enabled/disabled
  features: {
    darkMode: true,
    multiLanguage: true,
    search: true,
    export: false,
    import: false,
    bulkActions: false,
    advancedFilters: false,
  },
}

// Helper function to get translated text
export function t(key: string, lang: 'fr' | 'ar' = 'fr'): string {
  const keys = key.split('.')
  let current: any = dashboardConfig

  for (const k of keys) {
    current = current?.[k]
    if (!current) return key
  }

  if (typeof current === 'object' && lang in current) {
    return current[lang]
  }

  return current?.toString() || key
}
