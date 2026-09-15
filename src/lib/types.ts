export type ProductType = "BRIDE" | "GROOM";

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  sortOrder: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type OptionRef = {
  id: string;
  name: string;
  slug?: string;
  label?: string;
  extraPrice: number;
  aiPromptTag?: string | null;
  imageUrl?: string | null;
  swatchImageUrl?: string | null;
  hexCode?: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  type: ProductType;
  shortDescription: string | null;
  description: string;
  price: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  isNew: boolean;
  isPublished: boolean;
  isTryOnEnabled: boolean;
  categoryId: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = Product & {
  images: ProductImage[];
  materials: OptionRef[];
  styles: OptionRef[];
  colors: OptionRef[];
  sizes: OptionRef[];
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  note: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  orderCode: string;
  customerId: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  shippingAddress: string;
  shippingCity: string | null;
  note: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentProofUrl: string | null;
  paymentConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

export type TryOnStatus =
  | "AWAITING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type TryOnRequest = {
  id: string;
  requestCode: string;
  customerId: string | null;
  productId: string;
  productName?: string;
  fullName: string;
  phone: string;
  email: string | null;
  selectedStyle: string | null;
  selectedMaterial: string | null;
  selectedColor: string | null;
  customerPhotoUrl: string;
  resultImageUrl: string | null;
  fee: number;
  paymentProofUrl: string | null;
  paymentConfirmedAt: string | null;
  status: TryOnStatus;
  aiProvider: string | null;
  aiError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  customerId: string | null;
  name: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTime: string;
  appointmentType: string;
  message: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  depositRequired: number;
  depositPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  postCount?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  contentHtml: string;
  categoryId: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  author: string;
  isPublished: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  readingMinutes: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorDark: string;
  currencyCode: string;
  currencyLocale: string;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  zaloUrl: string | null;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankBsb: string;
  bankQrImageUrl: string | null;
  defaultShippingFee: number;
  freeShippingThreshold: number;
  tryOnFee: number;
  appointmentDeposit: number;
  homeContentJson: string;
  updatedAt: string;
};

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaLabel: string;
  introTitle: string;
  introBody: string;
  introImageUrl: string;
  storyTitle: string;
  storyBody: string;
  storyImageUrl: string;
  testimonials: { name: string; quote: string }[];
};
