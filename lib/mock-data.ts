// Mock data for the Diwan Admin Dashboard

export interface Category {
  id: string
  name: string
  nameAr: string
  slug: string
  icon: string
  order: number
}

export interface SubCategory {
  id: string
  categoryId: string
  name: string
  nameAr: string
  slug: string
  order: number
}

export interface Collection {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  image: string
  order: number
}

export interface Product {
  id: string
  name: string
  nameAr: string
  categoryId: string
  subCategoryId: string
  price: number
  originalPrice: number
  description: string
  descriptionAr: string
  image: string
  sku: string
  stock: number
  collections: string[]
}

export interface Discount {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  maxUses: number
  usedCount: number
  startDate: string
  endDate: string
  active: boolean
}

export interface BlackFriday {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  discount: number
  startDate: string
  endDate: string
  image: string
  active: boolean
}

export interface HappyHour {
  id: string
  name: string
  nameAr: string
  discount: number
  startTime: string
  endTime: string
  days: string[]
  active: boolean
}

// Mock Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Clothing', nameAr: 'الملابس', slug: 'clothing', icon: '👗', order: 1 },
  { id: '2', name: 'Accessories', nameAr: 'الإكسسوارات', slug: 'accessories', icon: '👜', order: 2 },
  { id: '3', name: 'Shoes', nameAr: 'الأحذية', slug: 'shoes', icon: '👞', order: 3 },
  { id: '4', name: 'Jewelry', nameAr: 'المجوهرات', slug: 'jewelry', icon: '💎', order: 4 },
]

// Mock SubCategories
export const mockSubCategories: SubCategory[] = [
  { id: '1', categoryId: '1', name: 'Dresses', nameAr: 'الفساتين', slug: 'dresses', order: 1 },
  { id: '2', categoryId: '1', name: 'Tops', nameAr: 'التوبات', slug: 'tops', order: 2 },
  { id: '3', categoryId: '2', name: 'Bags', nameAr: 'الحقائب', slug: 'bags', order: 1 },
  { id: '4', categoryId: '3', name: 'High Heels', nameAr: 'الكعب العالي', slug: 'high-heels', order: 1 },
]

// Mock Collections
export const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'Summer Collection 2024',
    nameAr: 'مجموعة الصيف 2024',
    description: 'Light and breezy pieces for summer',
    descriptionAr: 'قطع خفيفة وانسيابية للصيف',
    image: 'https://images.unsplash.com/photo-1515565182176-ade792e063d2?w=500',
    order: 1,
  },
  {
    id: '2',
    name: 'Luxury Edition',
    nameAr: 'الطبعة الفاخرة',
    description: 'Premium designer pieces',
    descriptionAr: 'قطع من المصممين الفاخرين',
    image: 'https://images.unsplash.com/photo-1495949897251-87613d649955?w=500',
    order: 2,
  },
]

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Elegant Black Dress',
    nameAr: 'فستان أسود أنيق',
    categoryId: '1',
    subCategoryId: '1',
    price: 299.99,
    originalPrice: 399.99,
    description: 'A timeless black dress perfect for any occasion',
    descriptionAr: 'فستان أسود كلاسيكي مثالي لأي مناسبة',
    image: 'https://images.unsplash.com/photo-1595777707802-51b0145f0c5f?w=500',
    sku: 'BD001',
    stock: 15,
    collections: ['1'],
  },
  {
    id: '2',
    name: 'Gold Jewelry Set',
    nameAr: 'مجموعة المجوهرات الذهبية',
    categoryId: '4',
    subCategoryId: '',
    price: 599.99,
    originalPrice: 799.99,
    description: 'Luxurious gold jewelry set',
    descriptionAr: 'مجموعة مجوهرات ذهبية فاخرة',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
    sku: 'JS001',
    stock: 8,
    collections: ['2'],
  },
]

// Mock Discounts
export const mockDiscounts: Discount[] = [
  {
    id: '1',
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    maxUses: 100,
    usedCount: 45,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    active: true,
  },
  {
    id: '2',
    code: 'FLAT50',
    type: 'fixed',
    value: 50,
    maxUses: 50,
    usedCount: 50,
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    active: false,
  },
]

// Mock Black Friday
export const mockBlackFriday: BlackFriday[] = [
  {
    id: '1',
    name: 'Black Friday Sale',
    nameAr: 'عرض الجمعة السوداء',
    description: 'Biggest sale of the year',
    descriptionAr: 'أكبر عرض بيع في السنة',
    discount: 50,
    startDate: '2024-11-29',
    endDate: '2024-12-02',
    image: 'https://images.unsplash.com/photo-1513161455079-7ef1a827e7f7?w=500',
    active: true,
  },
]

// Mock Happy Hour
export const mockHappyHour: HappyHour[] = [
  {
    id: '1',
    name: 'Evening Special',
    nameAr: 'عرض المساء الخاص',
    discount: 15,
    startTime: '18:00',
    endTime: '21:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    active: true,
  },
]
