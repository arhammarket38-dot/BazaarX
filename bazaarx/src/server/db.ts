import fs from 'fs';
import path from 'path';
import {
  User,
  Product,
  Category,
  Order,
  Coupon,
  FlashSale,
  Review,
  Warehouse,
  InventoryItem,
  BlogPost,
  CMSPage,
  AuditLog,
  StoreSettings,
  AdCampaign,
  AiAgent,
  AgentApprovalRequest,
  AgentActivityLog,
} from '../types.js';

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  brands: string[];
  orders: Order[];
  coupons: Coupon[];
  flashSales: FlashSale[];
  reviews: Review[];
  warehouses: Warehouse[];
  inventory: InventoryItem[];
  blogPosts: BlogPost[];
  pages: CMSPage[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
  ads: AdCampaign[];
  aiAgents: AiAgent[];
  agentApprovalRequests: AgentApprovalRequest[];
  agentActivityLogs: AgentActivityLog[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Initial realistic dataset
const initialSeedData: DatabaseSchema = {
  settings: {
    storeName: 'AURA Enterprise',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&auto=format&fit=crop&q=80',
    favicon: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=32&auto=format&fit=crop&q=80',
    supportEmail: 'support@aura-store.com',
    supportPhone: '+1 (800) 555-0199',
    currencySymbol: '$',
    currencyCode: 'USD',
    taxRate: 8.5,
    freeShippingThreshold: 99,
    standardShippingFee: 9.99,
    expressShippingFee: 24.99,
    maintenanceMode: false,
    enableLoyalty: true,
    pointsPerDollar: 10,
    autoApproveReviews: false,
  },
  users: [
    {
      id: 'usr_admin_arham',
      name: 'Abdul Arham',
      email: 'abdul.arham@enterprise.com',
      role: 'SUPER_ADMIN',
      group: 'PREMIUM',
      storeCredit: 1000,
      loyaltyPoints: 50000,
      referralCode: 'ARHAMADMIN',
      addresses: [
        {
          id: 'addr_arham_1',
          type: 'SHIPPING',
          isDefault: true,
          fullName: 'Abdul Arham',
          phone: '+1 415-555-0999',
          street: '100 Executive Boulevard',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States',
        },
      ],
      createdAt: '2025-01-01T08:00:00Z',
    },
    {
      id: 'usr_admin1',
      name: 'Alexander Wright',
      email: 'admin@enterprise.com',
      role: 'SUPER_ADMIN',
      group: 'PREMIUM',
      storeCredit: 500,
      loyaltyPoints: 12500,
      referralCode: 'ALEXVIP',
      addresses: [
        {
          id: 'addr_1',
          type: 'SHIPPING',
          isDefault: true,
          fullName: 'Alexander Wright',
          phone: '+1 415-555-0123',
          street: '100 Market Street, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States',
        },
      ],
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: 'usr_manager1',
      name: 'Sophia Chen',
      email: 'manager@enterprise.com',
      role: 'MANAGER',
      group: 'VIP',
      storeCredit: 100,
      loyaltyPoints: 2400,
      referralCode: 'SOPHIA20',
      addresses: [],
      createdAt: '2025-02-01T10:30:00Z',
    },
    {
      id: 'usr_cust1',
      name: 'Marcus Vance',
      email: 'customer@example.com',
      role: 'CUSTOMER',
      group: 'VIP',
      storeCredit: 150,
      loyaltyPoints: 3450,
      referralCode: 'MARCUS50',
      addresses: [
        {
          id: 'addr_2',
          type: 'SHIPPING',
          isDefault: true,
          fullName: 'Marcus Vance',
          phone: '+1 212-555-0198',
          street: '742 Evergreen Terrace',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
      ],
      createdAt: '2025-03-15T14:20:00Z',
    },
  ],
  categories: [
    {
      id: 'cat_electronics',
      name: 'Electronics & Audio',
      slug: 'electronics',
      description: 'Cutting-edge high-fidelity audio, smart devices, and premium wearables.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 1,
    },
    {
      id: 'cat_fashion',
      name: 'Apparel & Accessories',
      slug: 'fashion',
      description: 'Minimalist luxury apparel, engineered footwear, and handcrafted leather goods.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 2,
    },
    {
      id: 'cat_home',
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Modern ergonomic furniture, smart lighting, and curated interior decor.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 3,
    },
    {
      id: 'cat_fitness',
      name: 'Fitness & Outdoors',
      slug: 'fitness',
      description: 'Performance training gear, smart watches, and outdoor exploration gear.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      isFeatured: true,
      order: 4,
    },
    {
      id: 'cat_beauty',
      name: 'Beauty & Skincare',
      slug: 'beauty',
      description: 'Organic skincare formulas, botanical fragrances, and personal grooming tools.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
      order: 5,
    },
  ],
  brands: ['Sony', 'Apple', 'Aura Sound', 'Nordic Craft', 'Apex Athletic', 'Lumina Tech', 'Vanguard Leather'],
  products: [
    {
      id: 'prod_1',
      title: 'Aura Studio ANC Wireless Headphones',
      slug: 'aura-studio-anc-headphones',
      sku: 'AUD-HD-001',
      barcode: '8500123901',
      shortDescription: 'Studio-grade Active Noise Cancelling wireless headphones with 45-hour battery life.',
      description: 'Engineered with custom 40mm beryllium drivers, dual transparency modes, and magnetic memory foam ear cushions. Features active multi-point Bluetooth 5.3 connection and spatial acoustic tuning.',
      price: 349.99,
      compareAtPrice: 429.99,
      costPrice: 180.00,
      categoryId: 'cat_electronics',
      brand: 'Aura Sound',
      tags: ['Wireless', 'Headphones', 'ANC', 'Audio', 'Best Seller'],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&auto=format&fit=crop&q=80',
      ],
      rating: 4.9,
      reviewCount: 128,
      stock: 45,
      lowStockThreshold: 10,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      flashSalePrice: 299.99,
      attributes: [
        { name: 'Color', options: ['Matte Black', 'Silver Oak', 'Midnight Blue'] },
      ],
      variants: [
        { id: 'v_1_1', sku: 'AUD-HD-001-BLK', name: 'Matte Black', price: 349.99, stock: 25, color: 'Matte Black', colorHex: '#1e1e1e' },
        { id: 'v_1_2', sku: 'AUD-HD-001-SLV', name: 'Silver Oak', price: 349.99, stock: 20, color: 'Silver Oak', colorHex: '#d1d5db' },
      ],
      specifications: [
        { key: 'Driver Size', value: '40mm Beryllium Neodymium' },
        { key: 'Battery Life', value: 'Up to 45 Hours (ANC On)' },
        { key: 'Weight', value: '255g' },
        { key: 'Connectivity', value: 'Bluetooth 5.3 / 3.5mm AUX / USB-C' },
      ],
      warrantyInfo: '2-Year Manufacturer Express Replacement Warranty',
      returnPolicy: '30-Day Risk Free Money Back Guarantee',
      createdAt: '2025-01-05T00:00:00Z',
    },
    {
      id: 'prod_2',
      title: 'Apex Pro Smart Fitness & Health Tracker Watch',
      slug: 'apex-pro-smartwatch',
      sku: 'FIT-SW-002',
      barcode: '8500123902',
      shortDescription: 'Advanced GPS smartwatch with blood oxygen monitor, titanium case, and AMOLED display.',
      description: 'Crafted from grade-5 aerospace titanium with sapphire glass crystal. Features 24/7 continuous heart rate monitoring, HRV sleep score tracking, full-color topographic offline maps, and 100m water resistance.',
      price: 279.00,
      compareAtPrice: 329.00,
      costPrice: 130.00,
      categoryId: 'cat_fitness',
      brand: 'Apex Athletic',
      tags: ['Smartwatch', 'Fitness', 'GPS', 'Health'],
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=1000&auto=format&fit=crop&q=80',
      ],
      rating: 4.8,
      reviewCount: 94,
      stock: 18,
      lowStockThreshold: 5,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isNewArrival: true,
      attributes: [
        { name: 'Band Color', options: ['Graphite Titanium', 'Alpine Orange', 'Olive Green'] },
      ],
      variants: [
        { id: 'v_2_1', sku: 'FIT-SW-002-TI', name: 'Graphite Titanium', price: 279.00, stock: 10, color: 'Graphite Titanium', colorHex: '#374151' },
        { id: 'v_2_2', sku: 'FIT-SW-002-ORG', name: 'Alpine Orange', price: 279.00, stock: 8, color: 'Alpine Orange', colorHex: '#f97316' },
      ],
      specifications: [
        { key: 'Display', value: '1.4 inch Retina AMOLED (1000 nits)' },
        { key: 'Water Rating', value: '10 ATM (100 meters)' },
        { key: 'Battery', value: 'Up to 14 Days Normal Usage' },
      ],
      createdAt: '2025-02-10T00:00:00Z',
    },
    {
      id: 'prod_3',
      title: 'Nordic Minimalist Ergonomic Desk Lamp',
      slug: 'nordic-minimalist-desk-lamp',
      sku: 'HOM-LP-003',
      barcode: '8500123903',
      shortDescription: 'Warm LED architectural desk lamp with touch dimming, wireless charging base, and timer.',
      description: 'Designed in Copenhagen with anodized brushed aluminum and solid FSC-certified walnut wood. High CRI 95+ light spectrum reduces eye strain during long working sessions.',
      price: 129.50,
      compareAtPrice: 159.00,
      costPrice: 55.00,
      categoryId: 'cat_home',
      brand: 'Nordic Craft',
      tags: ['Home', 'Lighting', 'Ergonomic', 'Minimalist'],
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
      ],
      rating: 4.7,
      reviewCount: 62,
      stock: 60,
      lowStockThreshold: 15,
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      isNewArrival: true,
      attributes: [],
      variants: [],
      specifications: [
        { key: 'Power Consumption', value: '12W LED (Equivalent to 75W)' },
        { key: 'Color Temp', value: '2700K - 5500K Adjustable' },
        { key: 'Wireless Charging', value: '15W Qi Standard' },
      ],
      createdAt: '2025-02-20T00:00:00Z',
    },
    {
      id: 'prod_4',
      title: 'Vanguard Handcrafted Italian Leather Weekender Duffle',
      slug: 'vanguard-italian-leather-duffle',
      sku: 'FAS-BAG-004',
      barcode: '8500123904',
      shortDescription: 'Full-grain vegetable-tanned Italian leather duffle bag with brass hardware and shoe compartment.',
      description: 'Handstitched by master artisans in Florence. Features a padded 16-inch laptop sleeve, waterproof interior liner, dedicated breathable shoe section, and adjustable shoulder strap.',
      price: 489.00,
      compareAtPrice: 599.00,
      costPrice: 220.00,
      categoryId: 'cat_fashion',
      brand: 'Vanguard Leather',
      tags: ['Leather', 'Luggage', 'Travel', 'Luxury'],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop&q=80',
      ],
      rating: 5.0,
      reviewCount: 42,
      stock: 12,
      lowStockThreshold: 3,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      flashSalePrice: 399.00,
      attributes: [
        { name: 'Leather Finish', options: ['Cognac Brown', 'Obsidian Black', 'Espresso Tan'] },
      ],
      variants: [
        { id: 'v_4_1', sku: 'FAS-BAG-004-BRN', name: 'Cognac Brown', price: 489.00, stock: 7, color: 'Cognac Brown', colorHex: '#78350f' },
        { id: 'v_4_2', sku: 'FAS-BAG-004-BLK', name: 'Obsidian Black', price: 489.00, stock: 5, color: 'Obsidian Black', colorHex: '#111827' },
      ],
      specifications: [
        { key: 'Material', value: '100% Full-Grain Vegetable-Tanned Italian Leather' },
        { key: 'Dimensions', value: '52cm x 28cm x 26cm (42L)' },
        { key: 'Weight', value: '2.1 kg' },
      ],
      createdAt: '2025-01-18T00:00:00Z',
    },
    {
      id: 'prod_5',
      title: 'Lumina Portable Hi-Res Mechanical Keyboard',
      slug: 'lumina-mechanical-keyboard',
      sku: 'ELE-KB-005',
      barcode: '8500123905',
      shortDescription: 'Hot-swappable wireless mechanical keyboard with aluminum frame and PBT keycaps.',
      description: 'Features customized pre-lubed tactile linear switches, south-facing RGB lighting, gasket mount design, and multi-device seamless switching via 2.4GHz, Bluetooth 5.1, or USB-C.',
      price: 169.99,
      compareAtPrice: 199.99,
      costPrice: 75.00,
      categoryId: 'cat_electronics',
      brand: 'Lumina Tech',
      tags: ['Keyboard', 'Gaming', 'Office', 'Mechanical'],
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1000&auto=format&fit=crop&q=80',
      ],
      rating: 4.8,
      reviewCount: 79,
      stock: 35,
      lowStockThreshold: 8,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      isNewArrival: true,
      attributes: [
        { name: 'Switch Type', options: ['Gateron Oil Yellow (Linear)', 'Gateron Brown (Tactile)'] },
      ],
      variants: [],
      specifications: [
        { key: 'Key Count', value: '82 Keys (75% Compact Layout)' },
        { key: 'Battery Capacity', value: '4000mAh (Up to 200 hrs)' },
      ],
      createdAt: '2025-03-01T00:00:00Z',
    },
  ],
  orders: [
    {
      id: 'ord_1001',
      orderNumber: 'AURA-2025-8801',
      customerId: 'usr_cust1',
      customerName: 'Marcus Vance',
      customerEmail: 'customer@example.com',
      items: [
        {
          id: 'item_1',
          productId: 'prod_1',
          productTitle: 'Aura Studio ANC Wireless Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
          sku: 'AUD-HD-001-BLK',
          price: 349.99,
          quantity: 1,
          variantName: 'Matte Black',
        },
      ],
      subtotal: 349.99,
      discountTotal: 35.00,
      taxTotal: 26.77,
      shippingTotal: 0.00,
      grandTotal: 341.76,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      transactionId: 'txn_9823019238',
      shippingAddress: {
        id: 'addr_2',
        type: 'SHIPPING',
        isDefault: true,
        fullName: 'Marcus Vance',
        phone: '+1 212-555-0198',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      billingAddress: {
        id: 'addr_2_b',
        type: 'BILLING',
        isDefault: true,
        fullName: 'Marcus Vance',
        phone: '+1 212-555-0198',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      trackingNumber: 'TRK-9023418293-US',
      courierName: 'FedEx Express',
      estimatedDelivery: '2025-03-20T17:00:00Z',
      timeline: [
        { status: 'PENDING', timestamp: '2025-03-16T10:00:00Z', note: 'Order placed successfully by customer.' },
        { status: 'CONFIRMED', timestamp: '2025-03-16T10:05:00Z', note: 'Payment verified via Stripe.' },
        { status: 'PROCESSING', timestamp: '2025-03-16T11:30:00Z', note: 'Order assigned to Central Warehouse.' },
        { status: 'PACKED', timestamp: '2025-03-16T15:20:00Z', note: 'Packed in eco-friendly protective box.' },
        { status: 'SHIPPED', timestamp: '2025-03-17T08:00:00Z', note: 'Handed to FedEx Express.' },
        { status: 'DELIVERED', timestamp: '2025-03-19T14:35:00Z', note: 'Delivered to front door.' },
      ],
      createdAt: '2025-03-16T10:00:00Z',
    },
    {
      id: 'ord_1002',
      orderNumber: 'AURA-2025-8802',
      customerId: 'usr_cust1',
      customerName: 'Marcus Vance',
      customerEmail: 'customer@example.com',
      items: [
        {
          id: 'item_2',
          productId: 'prod_2',
          productTitle: 'Apex Pro Smart Fitness & Health Tracker Watch',
          productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
          sku: 'FIT-SW-002-TI',
          price: 279.00,
          quantity: 1,
          variantName: 'Graphite Titanium',
        },
      ],
      subtotal: 279.00,
      discountTotal: 0.00,
      taxTotal: 23.72,
      shippingTotal: 9.99,
      grandTotal: 312.71,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'CREDIT_CARD',
      transactionId: 'txn_9823019299',
      shippingAddress: {
        id: 'addr_2',
        type: 'SHIPPING',
        isDefault: true,
        fullName: 'Marcus Vance',
        phone: '+1 212-555-0198',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      billingAddress: {
        id: 'addr_2_b',
        type: 'BILLING',
        isDefault: true,
        fullName: 'Marcus Vance',
        phone: '+1 212-555-0198',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
      trackingNumber: 'UPS-8819230129-US',
      courierName: 'UPS Ground',
      estimatedDelivery: '2025-08-15T18:00:00Z',
      timeline: [
        { status: 'PENDING', timestamp: '2026-08-10T09:00:00Z', note: 'Order placed.' },
        { status: 'CONFIRMED', timestamp: '2026-08-10T09:10:00Z', note: 'Payment processed.' },
        { status: 'PROCESSING', timestamp: '2026-08-11T10:00:00Z', note: 'Preparing package.' },
        { status: 'SHIPPED', timestamp: '2026-08-12T08:30:00Z', note: 'In transit with UPS.' },
      ],
      createdAt: '2026-08-10T09:00:00Z',
    },
  ],
  coupons: [
    {
      id: 'cpn_1',
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      value: 10,
      minSpend: 50,
      expiryDate: '2026-12-31T23:59:59Z',
      usageCount: 142,
      usageLimit: 1000,
      isActive: true,
    },
    {
      id: 'cpn_2',
      code: 'SUMMER20',
      discountType: 'PERCENTAGE',
      value: 20,
      minSpend: 150,
      maxDiscount: 100,
      expiryDate: '2026-09-30T23:59:59Z',
      usageCount: 88,
      usageLimit: 500,
      isActive: true,
    },
    {
      id: 'cpn_3',
      code: 'FLASH50',
      discountType: 'FIXED',
      value: 50,
      minSpend: 250,
      expiryDate: '2026-08-31T23:59:59Z',
      usageCount: 45,
      usageLimit: 100,
      isActive: true,
    },
    {
      id: 'cpn_4',
      code: 'FREESHIP',
      discountType: 'FREE_SHIPPING',
      value: 0,
      minSpend: 30,
      expiryDate: '2026-12-31T23:59:59Z',
      usageCount: 310,
      usageLimit: 2000,
      isActive: true,
    },
  ],
  flashSales: [
    {
      id: 'fs_1',
      title: 'Summer Tech & Audio Flash Clearance',
      bannerImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2026-08-20T23:59:59Z',
      productIds: ['prod_1', 'prod_4'],
      discountPercentage: 25,
      isActive: true,
    },
  ],
  reviews: [
    {
      id: 'rev_1',
      productId: 'prod_1',
      userName: 'David Miller',
      rating: 5,
      title: 'Exceptional sound quality and battery life!',
      comment: 'I travel weekly for work and these ANC headphones are an absolute game changer. The active noise reduction blocks out engine noise completely, and the spatial acoustic soundstage is deep and balanced.',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 24,
      createdAt: '2025-02-12T11:20:00Z',
    },
    {
      id: 'rev_2',
      productId: 'prod_1',
      userName: 'Elena Rostova',
      rating: 5,
      title: 'So comfortable for 8+ hour work sessions',
      comment: 'The memory foam cushions feel like clouds on my ears. Microphones pick up my voice crystal clear on Zoom calls.',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 15,
      createdAt: '2025-02-28T14:45:00Z',
    },
    {
      id: 'rev_3',
      productId: 'prod_2',
      userName: 'Jonathan Briggs',
      rating: 5,
      title: 'Indestructible watch body with incredible GPS precision',
      comment: 'Used it on a 4-day mountain trek in Colorado. The topographic maps guided me effortlessly and battery still had 40% left!',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulCount: 32,
      createdAt: '2025-03-02T09:10:00Z',
    },
  ],
  warehouses: [
    {
      id: 'wh_main',
      name: 'Central Logistics Hub (West Coast)',
      code: 'WH-SF-01',
      address: '450 Industrial Parkway, Oakland, CA 94603',
      manager: 'Robert Sterling',
      contactEmail: 'logistics-sf@aura-store.com',
    },
    {
      id: 'wh_east',
      name: 'East Coast Distribution Center',
      code: 'WH-NJ-02',
      address: '1200 Commerce Blvd, Edison, NJ 08837',
      manager: 'Amanda Hayes',
      contactEmail: 'logistics-east@aura-store.com',
    },
  ],
  inventory: [
    {
      id: 'inv_1',
      productId: 'prod_1',
      productTitle: 'Aura Studio ANC Wireless Headphones',
      sku: 'AUD-HD-001',
      warehouseId: 'wh_main',
      warehouseName: 'Central Logistics Hub (West Coast)',
      availableStock: 30,
      reservedStock: 5,
      damagedStock: 0,
    },
    {
      id: 'inv_2',
      productId: 'prod_1',
      productTitle: 'Aura Studio ANC Wireless Headphones',
      sku: 'AUD-HD-001',
      warehouseId: 'wh_east',
      warehouseName: 'East Coast Distribution Center',
      availableStock: 15,
      reservedStock: 2,
      damagedStock: 0,
    },
  ],
  blogPosts: [
    {
      id: 'post_1',
      title: 'The Evolution of High-Fidelity Audio Engineering in 2026',
      slug: 'evolution-high-fidelity-audio-2026',
      category: 'Technology & Audio',
      excerpt: 'Explore how beryllium drivers, wireless multi-point Bluetooth 5.3, and acoustic spatial tuning are redefining luxury listening.',
      content: 'Acoustic science has achieved remarkable milestones over the past two years. With ultra-lightweight beryllium diaphragm drivers and AI-assisted ANC algorithms, listener immersion has reached concert-hall clarity...',
      featuredImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=80',
      author: 'Marcus Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      publishedAt: '2026-07-28T10:00:00Z',
      isPublished: true,
      tags: ['Audio', 'Headphones', 'Tech Insights'],
    },
    {
      id: 'post_2',
      title: 'Curating a Minimalist Workspace That Inspires Focus',
      slug: 'curating-minimalist-workspace',
      category: 'Design & Home',
      excerpt: 'Simple ergonomic strategies, lighting temperature control, and premium materials that transform your daily workflow.',
      content: 'Your physical environment directly influences focus, mental stamina, and creative flow. Eliminating visual clutter while investing in high-CRI illumination creates a sanctuary for high-impact work...',
      featuredImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1000&auto=format&fit=crop&q=80',
      author: 'Sophia Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      publishedAt: '2026-08-05T14:30:00Z',
      isPublished: true,
      tags: ['Minimalism', 'Interior Design', 'Productivity'],
    },
  ],
  pages: [
    {
      id: 'pg_about',
      slug: 'about-us',
      title: 'About AURA Enterprise',
      content: 'AURA is an enterprise e-commerce destination committed to uncompromising craftsmanship, timeless aesthetic design, and seamless customer experiences worldwide.',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'pg_privacy',
      slug: 'privacy-policy',
      title: 'Privacy Policy & Data Security',
      content: 'We adhere strictly to international data security standards (GDPR / CCPA). Your personal details, payment security, and communication preferences are encrypted at rest.',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'pg_returns',
      slug: 'shipping-returns',
      title: 'Global Shipping & Express Returns',
      content: 'We offer free express shipping on orders over $99. Enjoy a 30-day hassle-free return window with prepaid return labels provided automatically.',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
  auditLogs: [
    {
      id: 'log_1',
      userName: 'Alexander Wright',
      userRole: 'SUPER_ADMIN',
      action: 'LOGIN_SUCCESS',
      entity: 'AUTH',
      details: 'Super Admin logged in from San Francisco office IP.',
      ipAddress: '192.168.1.100',
      timestamp: '2026-08-12T19:00:00Z',
    },
    {
      id: 'log_2',
      userName: 'Alexander Wright',
      userRole: 'SUPER_ADMIN',
      action: 'UPDATE_PRODUCT_PRICE',
      entity: 'PRODUCT',
      entityId: 'prod_1',
      details: 'Updated price for Aura Studio ANC Wireless Headphones from $369.99 to $349.99',
      ipAddress: '192.168.1.100',
      timestamp: '2026-08-12T19:25:00Z',
    },
  ],
  ads: [
    {
      id: 'ad_hero_1',
      title: '2026 Architectural Hardware & Acoustics Clearance',
      subtitle: 'Discover beryllium acoustics and full-grain Italian leather workspace gear.',
      type: 'HERO_BANNER',
      placement: 'HOME_HERO',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      targetUrl: '/category/electronics',
      ctaText: 'Shop Flash Clearance',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2026-09-30T23:59:59Z',
      budget: 1500,
      impressions: 14200,
      clicks: 1850,
      status: 'ACTIVE',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: 'ad_header_top',
      title: '⚡ Free Express Global Shipping on Orders Over $99',
      subtitle: 'Use code FREESHIP at checkout',
      type: 'TOP_HEADER_BAR',
      placement: 'HEADER_ANNOUNCEMENT',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
      targetUrl: '/shop',
      ctaText: 'Claim Free Shipping',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      budget: 500,
      impressions: 28900,
      clicks: 3410,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'ad_sidebar_watch',
      title: 'Apex Pro Titanium Smartwatch - 20% OFF Limited Drop',
      subtitle: '100m Water Resistant Topographic AMOLED',
      type: 'SIDEBAR_PROMO',
      placement: 'PRODUCT_SIDEBAR',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      targetUrl: '/product/apex-pro-smartwatch',
      ctaText: 'Explore Apex Pro',
      startDate: '2026-08-10T00:00:00Z',
      endDate: '2026-08-25T23:59:59Z',
      budget: 800,
      impressions: 5600,
      clicks: 620,
      status: 'ACTIVE',
      createdAt: '2026-08-10T10:00:00Z',
    },
  ],
  aiAgents: [
    {
      id: 'agent_sales',
      name: '🛍️ Sales Agent',
      code: 'sales',
      icon: 'ShoppingBag',
      role: 'Sales & Recommendations',
      status: 'ACTIVE',
      description: 'Customer se products discuss, recommendations, upselling, and order/cart draft creation.',
      assignedTasks: [
        'Product recommendation discussion',
        'Upselling accessory add-ons',
        'Drafting orders/carts for customers',
        'Answering price inquiries'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Live Product Catalog Database',
        'Inventory Status per Warehouse',
        'Recommended Cross-Sells Matrix'
      ],
      allowedActions: [
        'view_products',
        'recommend_products',
        'create_cart',
        'add_to_cart'
      ],
      permissionLevel: 'ACTION',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 500000,
      tokensUsedToday: 42100,
      executionLimitPerHour: 100,
      hourlyExecutions: 8,
      monthlyBudgetUsd: 50.00,
      spentUsd: 12.45,
      activityCount: 245,
      lastActive: '2026-08-12T22:15:30Z'
    },
    {
      id: 'agent_support',
      name: '💬 Customer Support Agent',
      code: 'support',
      icon: 'MessageSquare',
      role: 'General Inquiries & FAQs',
      status: 'ACTIVE',
      description: 'Questions, complaints, FAQs, and explanations of store policies (refunds, shipping, etc.)',
      assignedTasks: [
        'Handling FAQs & knowledge base lookups',
        'Explaining Return, Refund & Exchange policies',
        'Receiving complaints & general inquiries'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'FAQ Knowledge Base Docs',
        'Return, Shipping & Lifetime Warranty Policy Guidelines',
        'Contact Center Helpdesk Guidelines'
      ],
      allowedActions: [
        'view_policies',
        'generate_support_reply',
        'create_support_ticket'
      ],
      permissionLevel: 'ASSIST',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 800000,
      tokensUsedToday: 112500,
      executionLimitPerHour: 200,
      hourlyExecutions: 24,
      monthlyBudgetUsd: 80.00,
      spentUsd: 21.60,
      activityCount: 512,
      lastActive: '2026-08-12T22:18:12Z'
    },
    {
      id: 'agent_order',
      name: '📦 Order Agent',
      code: 'order',
      icon: 'Package',
      role: 'Order Status & Requests',
      status: 'ACTIVE',
      description: 'Order status, tracking, and processing of cancellation or return requests.',
      assignedTasks: [
        'Order status lookup',
        'Shipment tracking status verification',
        'Filing order cancellation and return requests'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Live Orders Ledger',
        'Courier Tracking APIs Integration',
        'Order Cancellation Policy Limits'
      ],
      allowedActions: [
        'view_orders',
        'check_tracking',
        'request_cancellation',
        'request_return'
      ],
      permissionLevel: 'ADMIN_APPROVAL_REQUIRED',
      humanApprovalRequired: true,
      approvalTriggers: [
        'High-value order cancellation (> $150)',
        'Standard refund trigger on cancellation',
        'Manual address override request'
      ],
      tokenLimitPerDay: 400000,
      tokensUsedToday: 35000,
      executionLimitPerHour: 80,
      hourlyExecutions: 3,
      monthlyBudgetUsd: 40.00,
      spentUsd: 5.20,
      activityCount: 89,
      lastActive: '2026-08-12T22:10:05Z'
    },
    {
      id: 'agent_product',
      name: '🔎 Product Agent',
      code: 'product',
      icon: 'Search',
      role: 'Search & Specifications',
      status: 'ACTIVE',
      description: 'Product search, side-by-side comparison, and precise specifications lookups.',
      assignedTasks: [
        'Detailed product database search',
        'Side-by-side comparison of items',
        'Technical specs & manuals verification'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Full Technical Specs Sheets',
        'Interactive Compatibility Matrices',
        'Product Catalog Database'
      ],
      allowedActions: [
        'view_products',
        'compare_products',
        'search_specifications'
      ],
      permissionLevel: 'READ_ONLY',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 1000000,
      tokensUsedToday: 180000,
      executionLimitPerHour: 300,
      hourlyExecutions: 45,
      monthlyBudgetUsd: 100.00,
      spentUsd: 34.50,
      activityCount: 810,
      lastActive: '2026-08-12T22:19:00Z'
    },
    {
      id: 'agent_payment',
      name: '💳 Payment Agent',
      code: 'payment',
      icon: 'CreditCard',
      role: 'Failed Payment Diagnosis',
      status: 'ACTIVE',
      description: 'Payment status verification, failed payment diagnosis, and instruction delivery.',
      assignedTasks: [
        'Checking transaction statuses',
        'Diagnosing transaction failure codes',
        'Delivering manual payment gateway instructions'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Stripe Failed Transaction Logs (Masked)',
        'Payment Gateway Instruction Bank',
        'Bank Declines Troubleshooting DB'
      ],
      allowedActions: [
        'view_payment_status',
        'diagnose_failed_payment'
      ],
      permissionLevel: 'READ_ONLY',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 200000,
      tokensUsedToday: 15200,
      executionLimitPerHour: 50,
      hourlyExecutions: 1,
      monthlyBudgetUsd: 25.00,
      spentUsd: 4.80,
      activityCount: 43,
      lastActive: '2026-08-12T21:40:22Z'
    },
    {
      id: 'agent_shipping',
      name: '🚚 Shipping Agent',
      code: 'shipping',
      icon: 'Truck',
      role: 'Rates & ETA Estimations',
      status: 'ACTIVE',
      description: 'Calculates courier delivery charges, transit ETA, and carrier tracking updates.',
      assignedTasks: [
        'Calculating dimensional weight shipping rates',
        'Estimating courier ETA options',
        'Tracking multi-carrier shipping dispatches'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Courier Surcharges & Zone Tariffs',
        'Fulfillment Centers SLA Agreements',
        'Postcodes Transit Duration Matrix'
      ],
      allowedActions: [
        'calculate_shipping',
        'get_dispatch_eta',
        'view_shipping_methods'
      ],
      permissionLevel: 'ASSIST',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 300000,
      tokensUsedToday: 24500,
      executionLimitPerHour: 100,
      hourlyExecutions: 5,
      monthlyBudgetUsd: 30.00,
      spentUsd: 7.10,
      activityCount: 112,
      lastActive: '2026-08-12T22:12:44Z'
    },
    {
      id: 'agent_return_refund',
      name: '🔄 Return & Refund Agent',
      code: 'return_refund',
      icon: 'RotateCcw',
      role: 'Refund Eligibility Checks',
      status: 'ACTIVE',
      description: 'Return/refund requests processing and automated policy checking.',
      assignedTasks: [
        'Verifying order item purchase date rules',
        'Calculating restocking fees',
        'Drafting refund instructions for Approved orders'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        '30-Day Hard Return Policy Limits',
        'Order Purchase Dates & Return Windows Ledger',
        'Item Condition Grading Rulebook'
      ],
      allowedActions: [
        'check_refund_eligibility',
        'initiate_draft_refund'
      ],
      permissionLevel: 'ADMIN_APPROVAL_REQUIRED',
      humanApprovalRequired: true,
      approvalTriggers: [
        'Any refund release amount > $0',
        'Waiving restocking fee override',
        'Out-of-policy date threshold overrides'
      ],
      tokenLimitPerDay: 250000,
      tokensUsedToday: 18100,
      executionLimitPerHour: 60,
      hourlyExecutions: 2,
      monthlyBudgetUsd: 35.00,
      spentUsd: 4.50,
      activityCount: 36,
      lastActive: '2026-08-12T20:55:18Z'
    },
    {
      id: 'agent_analytics',
      name: '📊 Analytics Agent',
      code: 'analytics',
      icon: 'BarChart3',
      role: 'Sales & Growth Reports',
      status: 'ACTIVE',
      description: 'Sales, customer acquisition, and product movement report compilation.',
      assignedTasks: [
        'Aggregating live store sales reports',
        'Compiling customer lifetime value (LTV) insights',
        'Identifying slow-moving stock inventory warnings'
      ],
      aiModel: 'gemini-3.1-pro-preview',
      knowledgeSources: [
        'Anonymized Orders Ledger',
        'Daily Site Visitors Traffic Database',
        'Customer Group Purchase Analytics'
      ],
      allowedActions: [
        'generate_sales_reports',
        'compile_retention_data'
      ],
      permissionLevel: 'ASSIST',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 150000,
      tokensUsedToday: 35000,
      executionLimitPerHour: 30,
      hourlyExecutions: 1,
      monthlyBudgetUsd: 120.00,
      spentUsd: 41.20,
      activityCount: 42,
      lastActive: '2026-08-12T18:30:15Z'
    },
    {
      id: 'agent_inventory',
      name: '📦 Inventory Agent',
      code: 'inventory',
      icon: 'Warehouse',
      role: 'Stock Level Monitoring',
      status: 'ACTIVE',
      description: 'Stock monitoring, warehouse allocation checks, and low-stock threshold alerts.',
      assignedTasks: [
        'Live stock level monitoring per SKU',
        'Calculating low-stock warning triggers',
        'Verifying multi-warehouse distribution states'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Warehouses & Bin Allocations Matrix',
        'Supplier Catalog Procurement Lead Times',
        'SKU Stock Threshold Alert Settings'
      ],
      allowedActions: [
        'view_stock_levels',
        'trigger_low_stock_warning'
      ],
      permissionLevel: 'READ_ONLY',
      humanApprovalRequired: false,
      approvalTriggers: [],
      tokenLimitPerDay: 300000,
      tokensUsedToday: 32400,
      executionLimitPerHour: 100,
      hourlyExecutions: 6,
      monthlyBudgetUsd: 30.00,
      spentUsd: 6.80,
      activityCount: 198,
      lastActive: '2026-08-12T22:17:45Z'
    },
    {
      id: 'agent_marketing',
      name: '📣 Marketing Agent',
      code: 'marketing',
      icon: 'Megaphone',
      role: 'Coupons & Cart Recovery',
      status: 'ACTIVE',
      description: 'Promotional campaigns, coupons management, and abandoned cart push triggers.',
      assignedTasks: [
        'Abandoned checkout identification',
        'Drafting campaign promotional layouts',
        'Applying dynamic discount codes'
      ],
      aiModel: 'gemini-3.6-flash',
      knowledgeSources: [
        'Active Store Promos Ledger',
        'Guest & Registered Checkout Sessions DB',
        'Customer Preferences Tag Registry'
      ],
      allowedActions: [
        'apply_coupon',
        'draft_campaign',
        'view_abandoned_carts'
      ],
      permissionLevel: 'ADVANCED_ACTION',
      humanApprovalRequired: true,
      approvalTriggers: [
        'Creating public coupon exceeding 20% discount',
        'Launching high-volume automated marketing campaigns',
        'Waiving cart values via customized credit'
      ],
      tokenLimitPerDay: 500000,
      tokensUsedToday: 68000,
      executionLimitPerHour: 120,
      hourlyExecutions: 11,
      monthlyBudgetUsd: 60.00,
      spentUsd: 14.80,
      activityCount: 154,
      lastActive: '2026-08-12T22:05:12Z'
    },
    {
      id: 'agent_fraud',
      name: '🛡️ Fraud/Risk Agent',
      code: 'fraud_risk',
      icon: 'ShieldAlert',
      role: 'Risk Analysis & Halts',
      status: 'ACTIVE',
      description: 'Scans orders for suspicious indicators and flags transactions for approval.',
      assignedTasks: [
        'Scoring transactional risk flags',
        'Cross-checking billing and shipping address match',
        'Muting suspicious accounts'
      ],
      aiModel: 'gemini-3.1-pro-preview',
      knowledgeSources: [
        'Banned Email Domain Registry',
        'Mismatched Billing GeoIP Matrix',
        'Velocity Limit Rules Configurations'
      ],
      allowedActions: [
        'score_risk_level',
        'flag_suspicious_order',
        'halt_transaction'
      ],
      permissionLevel: 'ADMIN_APPROVAL_REQUIRED',
      humanApprovalRequired: true,
      approvalTriggers: [
        'Releasing locked credit hold on fraud matches',
        'Banning accounts with valid active orders',
        'Approving mismatched billing orders > $200'
      ],
      tokenLimitPerDay: 300000,
      tokensUsedToday: 11200,
      executionLimitPerHour: 50,
      hourlyExecutions: 2,
      monthlyBudgetUsd: 75.00,
      spentUsd: 15.20,
      activityCount: 29,
      lastActive: '2026-08-12T21:18:00Z'
    },
    {
      id: 'agent_admin_assistant',
      name: '👨💼 Admin Assistant Agent',
      code: 'admin_assistant',
      icon: 'Briefcase',
      role: 'Admin Tasks Executor',
      status: 'ACTIVE',
      description: 'Executes direct admin-driven commands, compiles system reports, and executes batch tasks.',
      assignedTasks: [
        'Executing bulk discount shifts',
        'Generating audit-ready CSV data packages',
        'Evaluating low-efficiency inventory bottlenecks'
      ],
      aiModel: 'gemini-3.1-pro-preview',
      knowledgeSources: [
        'Enterprise Resource Configuration Ledger',
        'Fulfillment Lead Times Registry',
        'Audit Logging Target Standards'
      ],
      allowedActions: [
        'run_system_health_check',
        'generate_audit_summaries'
      ],
      permissionLevel: 'ADVANCED_ACTION',
      humanApprovalRequired: true,
      approvalTriggers: [
        'Re-triggering system DB synchronization scripts',
        'Applying multi-record price hikes',
        'Exporting customer database lists'
      ],
      tokenLimitPerDay: 200000,
      tokensUsedToday: 15000,
      executionLimitPerHour: 40,
      hourlyExecutions: 1,
      monthlyBudgetUsd: 90.00,
      spentUsd: 18.50,
      activityCount: 18,
      lastActive: '2026-08-12T19:40:00Z'
    },
    {
      id: 'agent_supervisor',
      name: '🤖 Supervisor Agent',
      code: 'supervisor',
      icon: 'GitMerge',
      role: 'Orchestrator & Router',
      status: 'ACTIVE',
      description: 'Routes incoming customer statements, coordinates specialized agents, and ensures strict policy compliance.',
      assignedTasks: [
        'Incoming natural language query router',
        'Task delegation auditing',
        'Workflow compliance enforcement'
      ],
      aiModel: 'gemini-3.1-pro-preview',
      knowledgeSources: [
        'Active Agents capabilities JSON',
        'Escalation Level thresholds',
        'Unified System Guidelines policy'
      ],
      allowedActions: [
        'route_request',
        'audit_agent_compliance'
      ],
      permissionLevel: 'FULL_ACCESS',
      humanApprovalRequired: true,
      approvalTriggers: [
        'Executing full agent re-routing configurations',
        'Bypassing safety checkpoints for critical orders',
        'Modifying other AI Agents active credentials'
      ],
      tokenLimitPerDay: 1000000,
      tokensUsedToday: 125000,
      executionLimitPerHour: 250,
      hourlyExecutions: 12,
      monthlyBudgetUsd: 150.00,
      spentUsd: 38.60,
      activityCount: 412,
      lastActive: '2026-08-12T22:19:10Z'
    }
  ],
  agentApprovalRequests: [
    {
      id: 'req_1',
      agentId: 'agent_return_refund',
      agentName: '🔄 Return & Refund Agent',
      actionType: 'REFUND_INITIATE',
      targetEntity: 'Order Refund',
      targetEntityId: 'ord_1',
      requestDetails: 'Initiate a 100% refund of $249.00 for Marcus Vance. Item returned under category defect. Code verified and compliant.',
      customerName: 'Marcus Vance',
      customerEmail: 'customer@example.com',
      proposedData: {
        refundAmount: 249.00,
        restockingFeeWaived: true,
        reason: 'Product defective'
      },
      status: 'PENDING',
      requestedAt: '2026-08-12T21:40:00Z'
    },
    {
      id: 'req_2',
      agentId: 'agent_order',
      agentName: '📦 Order Agent',
      actionType: 'ORDER_CANCEL',
      targetEntity: 'Active Order',
      targetEntityId: 'ord_2',
      requestDetails: 'Cancel high-value order #ord_2 of $319.00 on behalf of Sophia Chen. Request validated within the 2-hour free window.',
      customerName: 'Sophia Chen',
      customerEmail: 'manager@enterprise.com',
      proposedData: {
        orderId: 'ord_2',
        totalRefund: 319.00,
        cancelReason: 'Customer requested cancellation via Support Chat'
      },
      status: 'APPROVED',
      requestedAt: '2026-08-12T19:15:00Z',
      reviewedBy: 'Alexander Wright',
      reviewedAt: '2026-08-12T19:20:00Z'
    }
  ],
  agentActivityLogs: [
    {
      id: 'act_1',
      agentId: 'agent_sales',
      agentName: '🛍️ Sales Agent',
      action: 'Recommended matching leather sleeve for Sophia\'s desk setup.',
      inputPrompt: 'Recommend an accessory under $50 that goes well with a leather desk mat.',
      outputResult: 'Recommended the "Premium Leather Pen Loop" at $29.00. Product added as option.',
      tokensUsed: 1250,
      approvalRequired: false,
      status: 'SUCCESS',
      timestamp: '2026-08-12T22:15:30Z'
    },
    {
      id: 'act_2',
      agentId: 'agent_return_refund',
      agentName: '🔄 Return & Refund Agent',
      action: 'Triggered draft refund request for Order ord_1.',
      inputPrompt: 'Mera refund process kar do, item defective hai.',
      outputResult: 'Order checked. Compliant under 30-day window. Draft refund of $249.00 generated. Action locked: requires Admin Approval.',
      tokensUsed: 2100,
      approvalRequired: true,
      status: 'PENDING_APPROVAL',
      timestamp: '2026-08-12T21:40:00Z'
    }
  ]
};

let memoryDb: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(fileContent);
      
      // Dynamic backfill of AI Agents schema properties
      if (!memoryDb.aiAgents || memoryDb.aiAgents.length === 0) {
        memoryDb.aiAgents = JSON.parse(JSON.stringify(initialSeedData.aiAgents));
      }
      if (!memoryDb.agentApprovalRequests) {
        memoryDb.agentApprovalRequests = JSON.parse(JSON.stringify(initialSeedData.agentApprovalRequests));
      }
      if (!memoryDb.agentActivityLogs) {
        memoryDb.agentActivityLogs = JSON.parse(JSON.stringify(initialSeedData.agentActivityLogs));
      }
    } else {
      memoryDb = JSON.parse(JSON.stringify(initialSeedData));
      saveDb(memoryDb!);
    }
  } catch (err) {
    console.error('Failed reading DB file, using initial seed dataset', err);
    memoryDb = JSON.parse(JSON.stringify(initialSeedData));
  }

  return memoryDb!;
}

export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing DB file', err);
  }
}

export function addAuditLog(
  userName: string,
  userRole: string,
  action: string,
  entity: string,
  details: string,
  entityId?: string,
  ipAddress = '127.0.0.1'
) {
  const db = getDb();
  const newLog: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userName,
    userRole,
    action,
    entity,
    entityId,
    details,
    ipAddress,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  saveDb(db);
}
