export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CATALOG_MANAGER' | 'SUPPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | Role;
  avatar?: string;
  phone?: string;
  group: 'REGULAR' | 'VIP' | 'WHOLESALE' | 'PREMIUM';
  storeCredit: number;
  loyaltyPoints: number;
  referralCode: string;
  addresses: Address[];
  createdAt: string;
  passwordHash?: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  profileImage?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Address {
  id: string;
  type: 'SHIPPING' | 'BILLING';
  isDefault: boolean;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description: string;
  image: string;
  banner?: string;
  isFeatured: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  itemCount?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  color?: string;
  colorHex?: string;
  size?: string;
  image?: string;
}

export interface ProductAttribute {
  name: string;
  options: string[];
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  categoryId: string;
  subCategoryId?: string;
  brand: string;
  tags: string[];
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  weightKg?: number;
  warrantyInfo?: string;
  returnPolicy?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number; // e.g. 15 for 15% or $15
  minSpend?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
}

export interface FlashSale {
  id: string;
  title: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  productIds: string[];
  discountPercentage: number;
  isActive: boolean;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sku: string;
  price: number;
  quantity: number;
  variantName?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'PAYPAL' | 'STORE_CREDIT';
  transactionId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  timeline: OrderTimeline[];
  orderNotes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  userId?: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  manager: string;
  contactEmail: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  isPublished: boolean;
  tags: string[];
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  subtitle?: string;
  type: 'HERO_BANNER' | 'TOP_HEADER_BAR' | 'SIDEBAR_PROMO' | 'POPUP_INTERSTITIAL' | 'CATEGORY_SPONSORED';
  placement: 'HOME_HERO' | 'HEADER_ANNOUNCEMENT' | 'PRODUCT_SIDEBAR' | 'CART_POPUP' | 'FEATURED_GRID';
  image: string;
  targetUrl: string;
  ctaText: string;
  startDate: string;
  endDate: string;
  budget: number;
  impressions: number;
  clicks: number;
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'EXPIRED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  favicon: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number; // percentage, e.g. 8.5
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  maintenanceMode: boolean;
  enableLoyalty: boolean;
  pointsPerDollar: number;
  autoApproveReviews: boolean;
}

export type AgentPermissionLevel =
  | 'READ_ONLY'
  | 'ASSIST'
  | 'ACTION'
  | 'ADVANCED_ACTION'
  | 'ADMIN_APPROVAL_REQUIRED'
  | 'FULL_ACCESS';

export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface AiAgent {
  id: string;
  name: string;
  code: string;
  icon: string;
  role: string;
  status: AgentStatus;
  description: string;
  assignedTasks: string[];
  aiModel: string;
  knowledgeSources: string[];
  allowedActions: string[];
  permissionLevel: AgentPermissionLevel;
  humanApprovalRequired: boolean;
  approvalTriggers: string[];
  tokenLimitPerDay: number;
  tokensUsedToday: number;
  executionLimitPerHour: number;
  hourlyExecutions: number;
  monthlyBudgetUsd: number;
  spentUsd: number;
  activityCount: number;
  lastActive: string;
}

export interface AgentApprovalRequest {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  targetEntity: string;
  targetEntityId: string;
  requestDetails: string;
  customerName?: string;
  customerEmail?: string;
  proposedData?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AgentActivityLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  inputPrompt: string;
  outputResult: string;
  tokensUsed: number;
  approvalRequired: boolean;
  status: 'SUCCESS' | 'PENDING_APPROVAL' | 'REJECTED' | 'FAILED';
  timestamp: string;
}

