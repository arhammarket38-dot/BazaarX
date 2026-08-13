import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDb, saveDb, addAuditLog } from './src/server/db.js';
import { Order, OrderStatus, Product, Review, Coupon, Category, User, StoreSettings } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logger middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.url}`);
    next();
  });

  // Admin Verification Middleware
  const requireAdmin = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const userId = authHeader.replace('Bearer mock_jwt_token_', '');
    const db = getDb();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CATALOG_MANAGER', 'SUPPORT'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Admin access only.' });
    }

    (req as any).currentUser = user;
    next();
  };

  // API ROUTES //

  // Healthcheck
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const db = getDb();
    const input = (email || '').trim().toLowerCase();

    const userIdx = db.users.findIndex(
      (u) =>
        u.email.toLowerCase() === input ||
        u.name.toLowerCase() === input ||
        (input.includes('arham') && u.role === 'SUPER_ADMIN')
    );

    if (userIdx === -1) {
      return res.status(401).json({ error: 'Invalid email or name credentials' });
    }

    const user = db.users[userIdx];
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

    // Update login timestamp and IP
    user.lastLoginAt = new Date().toISOString();
    user.lastLoginIp = ip;
    user.updatedAt = new Date().toISOString();
    saveDb(db);

    addAuditLog(user.name, user.role, 'LOGIN_SUCCESS', 'AUTH', `User logged in successfully (${user.email})`);
    res.json({ user, token: `mock_jwt_token_${user.id}` });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const db = getDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const passwordHash = password ? `hashed_${password}` : 'hashed_password';

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role: 'CUSTOMER',
      group: 'REGULAR',
      loyaltyPoints: 100, // Welcome bonus
      storeCredit: 10.0,  // Welcome credit
      referralCode: 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      phone: phone || '',
      addresses: [],
      // Requested core fields
      passwordHash,
      status: 'ACTIVE',
      profileImage: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      lastLoginAt: new Date().toISOString(),
      lastLoginIp: ip,
      emailVerified: false,
      phoneVerified: false,
    };

    db.users.push(newUser);
    saveDb(db);
    addAuditLog(newUser.name, 'CUSTOMER', 'REGISTER_SUCCESS', 'AUTH', `New customer account registered (${newUser.email})`, newUser.id);

    res.json({ user: newUser, token: `mock_jwt_token_${newUser.id}` });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const db = getDb();
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = authHeader.replace('Bearer mock_jwt_token_', '');
    const user = db.users.find((u) => u.id === userId) || db.users[0];
    res.json({ user });
  });

  // Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    const db = getDb();
    db.settings = { ...db.settings, ...req.body };
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_SETTINGS', 'SETTINGS', 'Updated store settings');
    res.json(db.settings);
  });

  // Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    const db = getDb();
    // Add item counts dynamically
    const categories = db.categories.map((cat) => {
      const count = db.products.filter((p) => p.categoryId === cat.id).length;
      return { ...cat, itemCount: count };
    });
    res.json(categories);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const db = getDb();
    const newCategory: Category = {
      id: 'cat_' + Date.now(),
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: req.body.description || '',
      image: req.body.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      isFeatured: !!req.body.isFeatured,
      order: db.categories.length + 1,
    };
    db.categories.push(newCategory);
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'CREATE_CATEGORY', 'CATEGORY', `Created category ${newCategory.name}`, newCategory.id);
    res.json(newCategory);
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });

    db.categories[idx] = { ...db.categories[idx], ...req.body };
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_CATEGORY', 'CATEGORY', `Updated category ${db.categories[idx].name}`, req.params.id);
    res.json(db.categories[idx]);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.categories.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });

    const deleted = db.categories.splice(idx, 1)[0];
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'DELETE_CATEGORY', 'CATEGORY', `Deleted category ${deleted.name}`, req.params.id);
    res.json({ success: true });
  });

  // Brands
  app.get('/api/brands', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.brands);
  });

  // Products
  app.get('/api/products', (req: Request, res: Response) => {
    const db = getDb();
    let result = [...db.products];

    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isTrending,
      isFlashSale,
      sort,
    } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category) {
      result = result.filter((p) => p.categoryId === category);
    }

    if (brand) {
      const brandArr = (brand as string).split(',');
      result = result.filter((p) => brandArr.includes(p.brand));
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice as string));
    }

    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice as string));
    }

    if (rating) {
      result = result.filter((p) => p.rating >= parseFloat(rating as string));
    }

    if (inStock === 'true') {
      result = result.filter((p) => p.stock > 0);
    }

    if (isFeatured === 'true') {
      result = result.filter((p) => p.isFeatured);
    }

    if (isTrending === 'true') {
      result = result.filter((p) => p.isTrending);
    }

    if (isFlashSale === 'true') {
      result = result.filter((p) => p.isFlashSale);
    }

    // Sorting
    if (sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // default best selling / featured
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    res.json(result);
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const db = getDb();
    const product = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const related = db.products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);

    const reviews = db.reviews.filter((r) => r.productId === product.id && r.isApproved);

    res.json({ product, related, reviews });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const db = getDb();
    const newProduct: Product = {
      id: 'prod_' + Date.now(),
      title: req.body.title,
      slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: req.body.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      shortDescription: req.body.shortDescription || '',
      description: req.body.description || '',
      price: parseFloat(req.body.price) || 0,
      compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : undefined,
      costPrice: req.body.costPrice ? parseFloat(req.body.costPrice) : undefined,
      categoryId: req.body.categoryId || db.categories[0]?.id || 'cat_electronics',
      brand: req.body.brand || 'AURA',
      tags: req.body.tags || ['New'],
      images: req.body.images?.length
        ? req.body.images
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80'],
      rating: 5.0,
      reviewCount: 0,
      stock: parseInt(req.body.stock) || 10,
      lowStockThreshold: 5,
      isFeatured: !!req.body.isFeatured,
      isTrending: !!req.body.isTrending,
      isBestSeller: !!req.body.isBestSeller,
      isNewArrival: true,
      attributes: req.body.attributes || [],
      variants: req.body.variants || [],
      specifications: req.body.specifications || [],
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'CREATE_PRODUCT', 'PRODUCT', `Created product "${newProduct.title}"`, newProduct.id);
    res.json(newProduct);
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    db.products[idx] = { ...db.products[idx], ...req.body };
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_PRODUCT', 'PRODUCT', `Updated product "${db.products[idx].title}"`, req.params.id);
    res.json(db.products[idx]);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const deleted = db.products.splice(idx, 1)[0];
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'DELETE_PRODUCT', 'PRODUCT', `Deleted product "${deleted.title}"`, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/products/:id/duplicate', (req: Request, res: Response) => {
    const db = getDb();
    const original = db.products.find((p) => p.id === req.params.id);
    if (!original) return res.status(404).json({ error: 'Product not found' });

    const duplicate: Product = {
      ...original,
      id: 'prod_' + Date.now(),
      title: `${original.title} (Copy)`,
      sku: `${original.sku}-COPY`,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(duplicate);
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'DUPLICATE_PRODUCT', 'PRODUCT', `Duplicated "${original.title}"`, duplicate.id);
    res.json(duplicate);
  });

  // Coupons
  app.get('/api/coupons', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.coupons);
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const db = getDb();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === (code || '').toUpperCase() && c.isActive);

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return res.status(400).json({ error: `Minimum order spend for this code is $${coupon.minSpend}` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.value;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discountAmount = db.settings.standardShippingFee;
    }

    res.json({ coupon, discountAmount: Math.min(discountAmount, subtotal) });
  });

  app.post('/api/coupons', (req: Request, res: Response) => {
    const db = getDb();
    const newCoupon: Coupon = {
      id: 'cpn_' + Date.now(),
      code: req.body.code.toUpperCase(),
      discountType: req.body.discountType || 'PERCENTAGE',
      value: parseFloat(req.body.value) || 10,
      minSpend: req.body.minSpend ? parseFloat(req.body.minSpend) : 0,
      expiryDate: req.body.expiryDate || '2026-12-31T23:59:59Z',
      usageCount: 0,
      usageLimit: parseInt(req.body.usageLimit) || 100,
      isActive: true,
    };
    db.coupons.push(newCoupon);
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'CREATE_COUPON', 'MARKETING', `Created coupon "${newCoupon.code}"`, newCoupon.id);
    res.json(newCoupon);
  });

  // Flash sales
  app.get('/api/flash-sales', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.flashSales);
  });

  // Checkout & Orders
  app.post('/api/checkout', (req: Request, res: Response) => {
    const { customer, items, shippingAddress, billingAddress, paymentMethod, couponCode, storeCreditUsed } = req.body;
    const db = getDb();

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const prod = db.products.find((p) => p.id === item.productId);
      const price = item.variant?.price || prod?.flashSalePrice || prod?.price || 100;
      subtotal += price * item.quantity;

      // Adjust stock
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }

      return {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        productId: item.productId,
        productTitle: prod?.title || 'E-Commerce Product',
        productImage: prod?.images[0] || '',
        sku: item.variant?.sku || prod?.sku || 'SKU-000',
        price,
        quantity: item.quantity,
        variantName: item.variant?.name,
      };
    });

    let discountTotal = 0;
    if (couponCode) {
      const c = db.coupons.find((cp) => cp.code.toUpperCase() === couponCode.toUpperCase());
      if (c) {
        c.usageCount += 1;
        if (c.discountType === 'PERCENTAGE') {
          discountTotal = (subtotal * c.value) / 100;
        } else if (c.discountType === 'FIXED') {
          discountTotal = c.value;
        }
      }
    }

    if (storeCreditUsed && storeCreditUsed > 0) {
      discountTotal += Math.min(storeCreditUsed, subtotal - discountTotal);
    }

    const shippingTotal = subtotal >= db.settings.freeShippingThreshold ? 0 : db.settings.standardShippingFee;
    const taxTotal = Math.round(((subtotal - discountTotal) * db.settings.taxRate) / 100 * 100) / 100;
    const grandTotal = Math.max(0, Math.round((subtotal - discountTotal + shippingTotal + taxTotal) * 100) / 100);

    const orderNumber = `AURA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      customerId: customer?.id || 'usr_guest',
      customerName: customer?.name || shippingAddress?.fullName || 'Guest Customer',
      customerEmail: customer?.email || 'guest@example.com',
      items: orderItems,
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      grandTotal,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || 'CREDIT_CARD',
      transactionId: 'txn_' + Date.now(),
      shippingAddress: shippingAddress || db.users[2].addresses[0],
      billingAddress: billingAddress || shippingAddress || db.users[2].addresses[0],
      trackingNumber: `TRK-${Math.floor(1000000000 + Math.random() * 9000000000)}-US`,
      courierName: 'FedEx Express',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        { status: 'PENDING', timestamp: new Date().toISOString(), note: 'Order placed by customer.' },
        { status: 'CONFIRMED', timestamp: new Date().toISOString(), note: 'Payment verified successfully.' },
      ],
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb(db);

    addAuditLog('Store Engine', 'SYSTEM', 'CREATE_ORDER', 'ORDER', `New order ${orderNumber} for $${grandTotal}`, newOrder.id);

    res.json({ success: true, order: newOrder });
  });

  app.get('/api/orders', (req: Request, res: Response) => {
    const db = getDb();
    const { status, customerId } = req.query;

    let result = [...db.orders];
    if (status) {
      result = result.filter((o) => o.status === status);
    }
    if (customerId) {
      result = result.filter((o) => o.customerId === customerId);
    }

    res.json(result);
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status, note } = req.body;
    const db = getDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status as OrderStatus;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    } else if (status === 'REFUNDED') {
      order.paymentStatus = 'REFUNDED';
    }

    order.timeline.push({
      status: status as OrderStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}`,
      updatedBy: 'Admin',
    });

    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_ORDER_STATUS', 'ORDER', `Order ${order.orderNumber} changed to ${status}`, order.id);
    res.json(order);
  });

  // Reviews
  app.get('/api/reviews', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.reviews);
  });

  app.post('/api/reviews', (req: Request, res: Response) => {
    const db = getDb();
    const newReview: Review = {
      id: 'rev_' + Date.now(),
      productId: req.body.productId,
      userName: req.body.userName || 'Customer',
      rating: parseInt(req.body.rating) || 5,
      title: req.body.title || 'Great Product!',
      comment: req.body.comment || '',
      isVerifiedPurchase: true,
      isApproved: db.settings.autoApproveReviews,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Update product rating
    const prodReviews = db.reviews.filter((r) => r.productId === req.body.productId && r.isApproved);
    const prod = db.products.find((p) => p.id === req.body.productId);
    if (prod && prodReviews.length > 0) {
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.rating = Math.round(avg * 10) / 10;
      prod.reviewCount = prodReviews.length;
    }

    saveDb(db);
    res.json(newReview);
  });

  app.put('/api/reviews/:id/approve', (req: Request, res: Response) => {
    const db = getDb();
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) return res.status(404).json({ error: 'Review not found' });

    rev.isApproved = !rev.isApproved;
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'APPROVE_REVIEW', 'REVIEW', `Toggled approval for review ${rev.id}`);
    res.json(rev);
  });

  // Inventory
  app.get('/api/inventory', (req: Request, res: Response) => {
    const db = getDb();
    res.json({ inventory: db.inventory, warehouses: db.warehouses });
  });

  // Customers - Backward Compatibility Endpoint
  app.get('/api/customers', (req: Request, res: Response) => {
    const db = getDb();
    const safeUsers = db.users.map(u => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });
    res.json(safeUsers);
  });

  app.put('/api/customers/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer not found' });

    db.users[idx] = { ...db.users[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_CUSTOMER', 'CUSTOMER', `Updated customer ${db.users[idx].name}`);
    
    const safeUser = { ...db.users[idx] };
    delete safeUser.passwordHash;
    res.json(safeUser);
  });

  app.delete('/api/customers/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer not found' });

    if (db.users[idx].role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Super Admin accounts cannot be deleted' });
    }

    const deleted = db.users.splice(idx, 1)[0];
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'DELETE_CUSTOMER', 'CUSTOMER', `Deleted customer ${deleted.name} (${deleted.email})`, req.params.id);
    res.json({ success: true, deleted });
  });

  // Secure Admin-Only Customer Management Endpoints
  app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    let result = db.users.map((u) => {
      // Calculate dynamic aggregates
      const userOrders = db.orders.filter((o) => o.customerId === u.id || (o as any).userId === u.id);
      const totalOrders = userOrders.length;
      const totalSpending = userOrders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      const numReviews = db.reviews.filter((r) => r.userId === u.id || r.userEmail === u.email).length;
      const numReturns = userOrders.filter((o) => o.status === 'RETURNED' || o.status === 'REFUNDED').length;
      
      // Wishlist items count - fallback if not exists
      const numWishlist = (u as any).wishlistCount || (u.id === 'usr_cust1' ? 2 : 0);

      return {
        ...u,
        totalOrders,
        totalSpending,
        numReviews,
        numReturns,
        numWishlist,
        status: u.status || 'ACTIVE',
        emailVerified: u.emailVerified !== undefined ? u.emailVerified : true,
        phoneVerified: u.phoneVerified !== undefined ? u.phoneVerified : false,
      };
    });

    // Remove sensitive fields
    result.forEach((u) => delete u.passwordHash);

    // Apply search filter
    const { search, group, status, role, sortBy, sortOrder, page, limit, startDate, endDate, export: exportAll } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    // Apply tier/group filter
    if (group && group !== 'ALL') {
      result = result.filter((u) => u.group === group);
    }

    // Apply status filter
    if (status && status !== 'ALL') {
      result = result.filter((u) => u.status === status);
    }

    // Apply role filter
    if (role && role !== 'ALL') {
      result = result.filter((u) => u.role === role);
    }

    // Apply date filter
    if (startDate) {
      const start = new Date(startDate as string).getTime();
      result = result.filter((u) => new Date(u.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate as string).getTime();
      result = result.filter((u) => new Date(u.createdAt).getTime() <= end);
    }

    // Apply sorting
    if (sortBy) {
      const field = sortBy as string;
      const order = sortOrder === 'asc' ? 1 : -1;
      result.sort((a: any, b: any) => {
        const valA = a[field];
        const valB = b[field];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return 0;
      });
    } else {
      // Default sort by createdAt desc
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalCount = result.length;

    // Apply pagination unless export is requested
    if (exportAll === 'true') {
      return res.json({ customers: result, totalCount, page: 1, totalPages: 1 });
    }

    const p = parseInt(page as string) || 1;
    const l = parseInt(limit as string) || 10;
    const startIndex = (p - 1) * l;
    const paginated = result.slice(startIndex, startIndex + l);

    res.json({
      customers: paginated,
      totalCount,
      page: p,
      limit: l,
      totalPages: Math.ceil(totalCount / l),
    });
  });

  app.get('/api/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const u = db.users.find((user) => user.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'Customer not found' });

    const userOrders = db.orders.filter((o) => o.customerId === u.id || (o as any).userId === u.id);
    const totalOrders = userOrders.length;
    const totalSpending = userOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.grandTotal, 0);
    const numReviews = db.reviews.filter((r) => r.userId === u.id || r.userEmail === u.email).length;
    const numReturns = userOrders.filter((o) => o.status === 'RETURNED' || o.status === 'REFUNDED').length;
    const numWishlist = (u as any).wishlistCount || (u.id === 'usr_cust1' ? 2 : 0);

    const safeUser = {
      ...u,
      totalOrders,
      totalSpending,
      numReviews,
      numReturns,
      numWishlist,
      status: u.status || 'ACTIVE',
      emailVerified: u.emailVerified !== undefined ? u.emailVerified : true,
      phoneVerified: u.phoneVerified !== undefined ? u.phoneVerified : false,
    };
    delete safeUser.passwordHash;

    res.json(safeUser);
  });

  app.get('/api/admin/customers/:id/orders', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const userOrders = db.orders.filter((o) => o.customerId === req.params.id || (o as any).userId === req.params.id);
    res.json(userOrders);
  });

  app.get('/api/admin/customers/:id/wishlist', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    // Return first 2 real products as mock wishlist for demo if user_cust1, else empty
    const products = req.params.id === 'usr_cust1' ? db.products.slice(0, 2) : [];
    res.json(products);
  });

  app.get('/api/admin/customers/:id/reviews', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.id);
    const userReviews = db.reviews.filter((r) => r.userId === req.params.id || (user && r.userEmail === user.email));
    res.json(userReviews);
  });

  app.get('/api/admin/customers/:id/returns', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const userReturns = db.orders.filter(
      (o) => (o.customerId === req.params.id || (o as any).userId === req.params.id) && (o.status === 'RETURNED' || o.status === 'REFUNDED')
    );
    res.json(userReturns);
  });

  app.get('/api/admin/customers/:id/activity', requireAdmin, (req: Request, res: Response) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Customer not found' });

    const logs = db.auditLogs.filter((l) => l.entityId === req.params.id || l.userName === user.name);
    
    if (logs.length === 0) {
      const generatedLogs = [
        {
          id: 'act_1',
          timestamp: user.createdAt,
          action: 'REGISTER_SUCCESS',
          details: 'Registered a brand new account and received a $10 credit welcome bonus.',
          ipAddress: '127.0.0.1',
        },
        {
          id: 'act_2',
          timestamp: new Date(new Date(user.createdAt).getTime() + 120000).toISOString(),
          action: 'LOGIN_SUCCESS',
          details: 'Logged in successfully from device browser.',
          ipAddress: user.lastLoginIp || '127.0.0.1',
        },
      ];
      return res.json(generatedLogs);
    }

    res.json(logs);
  });

  // ADS & BANNERS MANAGEMENT
  app.get('/api/ads', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.ads || []);
  });

  app.post('/api/ads', (req: Request, res: Response) => {
    const db = getDb();
    if (!db.ads) db.ads = [];

    const newAd = {
      id: 'ad_' + Date.now(),
      title: req.body.title || 'Untitled Ad Campaign',
      subtitle: req.body.subtitle || '',
      type: req.body.type || 'HERO_BANNER',
      placement: req.body.placement || 'HOME_HERO',
      image: req.body.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      targetUrl: req.body.targetUrl || '/shop',
      ctaText: req.body.ctaText || 'Shop Now',
      startDate: req.body.startDate || new Date().toISOString(),
      endDate: req.body.endDate || '2026-12-31T23:59:59Z',
      budget: parseFloat(req.body.budget) || 500,
      impressions: 0,
      clicks: 0,
      status: req.body.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    db.ads.unshift(newAd);
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'CREATE_AD', 'MARKETING', `Created ad campaign ${newAd.title}`, newAd.id);
    res.status(201).json(newAd);
  });

  app.put('/api/ads/:id', (req: Request, res: Response) => {
    const db = getDb();
    if (!db.ads) db.ads = [];

    const idx = db.ads.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Ad not found' });

    db.ads[idx] = { ...db.ads[idx], ...req.body };
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'UPDATE_AD', 'MARKETING', `Updated ad campaign ${db.ads[idx].title}`, req.params.id);
    res.json(db.ads[idx]);
  });

  app.delete('/api/ads/:id', (req: Request, res: Response) => {
    const db = getDb();
    if (!db.ads) db.ads = [];

    const idx = db.ads.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Ad not found' });

    const deleted = db.ads.splice(idx, 1)[0];
    saveDb(db);
    addAuditLog('Admin', 'SUPER_ADMIN', 'DELETE_AD', 'MARKETING', `Deleted ad campaign ${deleted.title}`, req.params.id);
    res.json({ success: true, deleted });
  });

  app.post('/api/ads/:id/click', (req: Request, res: Response) => {
    const db = getDb();
    if (!db.ads) db.ads = [];

    const ad = db.ads.find((a) => a.id === req.params.id);
    if (ad) {
      ad.clicks += 1;
      saveDb(db);
    }
    res.json({ success: true });
  });

  // CMS & Blog
  app.get('/api/blog', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.blogPosts);
  });

  app.get('/api/cms/pages', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.pages);
  });

  // Analytics
  app.get('/api/analytics', (req: Request, res: Response) => {
    const db = getDb();

    const totalSales = db.orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.grandTotal : 0), 0);
    const totalOrders = db.orders.length;
    const pendingOrders = db.orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length;
    const completedOrders = db.orders.filter((o) => o.status === 'DELIVERED').length;
    const totalCustomers = db.users.filter((u) => u.role === 'CUSTOMER').length;
    const totalProducts = db.products.length;
    const lowStockProducts = db.products.filter((p) => p.stock <= p.lowStockThreshold).length;

    // Monthly chart data mock generator based on real DB
    const salesOverTime = [
      { month: 'Jan', revenue: 14200, orders: 48 },
      { month: 'Feb', revenue: 18500, orders: 62 },
      { month: 'Mar', revenue: 22400, orders: 75 },
      { month: 'Apr', revenue: 19800, orders: 68 },
      { month: 'May', revenue: 28900, orders: 92 },
      { month: 'Jun', revenue: 34100, orders: 110 },
      { month: 'Jul', revenue: 31200, orders: 104 },
      { month: 'Aug', revenue: Math.round(totalSales) + 38500, orders: totalOrders + 120 },
    ];

    const categoryBreakdown = db.categories.map((cat) => ({
      name: cat.name,
      value: db.products.filter((p) => p.categoryId === cat.id).length * 15 + Math.floor(Math.random() * 20),
    }));

    res.json({
      summary: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        conversionRate: 3.42,
        avgOrderValue: totalOrders ? Math.round((totalSales / totalOrders) * 100) / 100 : 0,
      },
      salesOverTime,
      categoryBreakdown,
    });
  });

  // Audit Logs
  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.auditLogs);
  });

  // Reset database to seed
  app.post('/api/seed/reset', (req: Request, res: Response) => {
    const dataDir = path.join(process.cwd(), 'data');
    const dbFile = path.join(dataDir, 'db.json');
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    const freshDb = getDb();
    res.json({ success: true, message: 'Database reset to initial seed data.', db: freshDb });
  });

  // AI Agents Endpoints
  app.get('/api/agents', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.aiAgents || []);
  });

  app.put('/api/agents/:id', (req: Request, res: Response) => {
    const db = getDb();
    const idx = db.aiAgents.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' });

    db.aiAgents[idx] = { ...db.aiAgents[idx], ...req.body };
    saveDb(db);
    addAuditLog(
      'Admin',
      'SUPER_ADMIN',
      'UPDATE_AGENT_CONFIG',
      'AI_AGENT',
      `Updated configuration for AI Agent ${db.aiAgents[idx].name}`,
      req.params.id
    );
    res.json(db.aiAgents[idx]);
  });

  app.get('/api/agents/approvals', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.agentApprovalRequests || []);
  });

  app.post('/api/agents/approvals/:id/respond', (req: Request, res: Response) => {
    const { status, rejectionReason } = req.body;
    const db = getDb();
    const reqIdx = db.agentApprovalRequests.findIndex((r) => r.id === req.params.id);
    if (reqIdx === -1) return res.status(404).json({ error: 'Approval request not found' });

    const approvalReq = db.agentApprovalRequests[reqIdx];
    approvalReq.status = status; // 'APPROVED' or 'REJECTED'
    approvalReq.reviewedBy = 'Abdul Arham'; // Supervisor name
    approvalReq.reviewedAt = new Date().toISOString();
    if (rejectionReason) approvalReq.rejectionReason = rejectionReason;

    // Execute the action if approved
    if (status === 'APPROVED') {
      if (approvalReq.actionType === 'REFUND_INITIATE') {
        const orderId = approvalReq.targetEntityId;
        const order = db.orders.find((o) => o.id === orderId);
        if (order) {
          order.status = 'RETURNED';
          order.paymentStatus = 'REFUNDED';
          order.timeline.push({
            status: 'RETURNED',
            timestamp: new Date().toISOString(),
            note: `Refund of $${approvalReq.proposedData?.refundAmount || order.grandTotal} approved by Admin via Return & Refund Agent automation.`,
            updatedBy: 'Admin (System)',
          });
          addAuditLog(
            'Admin (System)',
            'SUPER_ADMIN',
            'REFUND_APPROVED',
            'ORDER',
            `Approved refund of $${approvalReq.proposedData?.refundAmount || order.grandTotal} for Order ${order.orderNumber}`,
            order.id
          );
        }
      } else if (approvalReq.actionType === 'ORDER_CANCEL') {
        const orderId = approvalReq.targetEntityId;
        const order = db.orders.find((o) => o.id === orderId);
        if (order) {
          order.status = 'CANCELLED';
          order.paymentStatus = 'REFUNDED';
          order.timeline.push({
            status: 'CANCELLED',
            timestamp: new Date().toISOString(),
            note: `Cancellation approved by Admin via Order Agent request.`,
            updatedBy: 'Admin (System)',
          });
          addAuditLog(
            'Admin (System)',
            'SUPER_ADMIN',
            'CANCEL_APPROVED',
            'ORDER',
            `Approved cancellation for Order ${order.orderNumber}`,
            order.id
          );
        }
      }
    }

    saveDb(db);
    res.json(approvalReq);
  });

  app.get('/api/agents/logs', (req: Request, res: Response) => {
    const db = getDb();
    res.json(db.agentActivityLogs || []);
  });

  app.post('/api/agents/simulate', async (req: Request, res: Response) => {
    const { agentId, customerQuery } = req.body;
    const db = getDb();
    const agent = db.aiAgents.find((a) => a.id === agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    if (agent.status === 'INACTIVE') {
      return res.json({
        success: false,
        agentResponse: "Agent is currently INACTIVE. Enable this agent in the configuration before running tasks.",
        stepOutputs: ["Agent status verification failed. Execution halted."]
      });
    }

    // Step-by-step trace
    const steps: string[] = [];
    steps.push(`[Step 1] Supervisor received query: "${customerQuery}". Routing to ${agent.name}.`);
    steps.push(`[Step 2] Security Scan: Checking permission level for ${agent.name} (Level: ${agent.permissionLevel}).`);

    // Basic query analyzer
    const lowerQuery = customerQuery.toLowerCase();
    const isCancellation = lowerQuery.includes('cancel') || lowerQuery.includes('cancellation');
    const isRefund = lowerQuery.includes('refund') || lowerQuery.includes('return') || lowerQuery.includes('refund process');

    let permissionSufficient = true;
    let approvalNeeded = false;
    let responseText = '';
    let approvalCreatedId = '';

    // Check permissions
    if (isCancellation) {
      steps.push(`[Step 3] Parsing Intent: Order Cancellation requested.`);
      if (agent.id !== 'agent_order' && agent.id !== 'agent_supervisor') {
        steps.push(`[Step 4] Access Control Violation: Agent "${agent.name}" does not possess Order cancellation tools.`);
        permissionSufficient = false;
        responseText = `Violation of Security Policies: Access Denied. My toolset does not support order cancellation. Let me forward you to the Order Agent.`;
      } else {
        steps.push(`[Step 4] Tool Access Approved: Order Agent contains "request_cancellation" in its allowed actions.`);
        steps.push(`[Step 5] Checking Audit & Approval Rulebook...`);
        
        if (agent.permissionLevel === 'READ_ONLY' || agent.permissionLevel === 'ASSIST') {
          steps.push(`[Step 6] Execution Blocked: Current permission level (${agent.permissionLevel}) is READ-ONLY/ASSIST. This action requires 'ACTION' or above.`);
          permissionSufficient = false;
          responseText = `I cannot cancel this order for you because my current permission level is restricted to ${agent.permissionLevel}. Please ask an administrator to upgrade my permission level.`;
        } else {
          steps.push(`[Step 6] Approval Rule Triggered: All cancellations require Super Admin review ("High-value order cancellation").`);
          approvalNeeded = true;
          
          // Generate a mockup target order
          const mockOrder = db.orders[0] || { id: 'ord_1', orderNumber: 'AURA-29831', grandTotal: 249.00 };
          const reqId = 'req_' + Date.now();
          approvalCreatedId = reqId;

          const newRequest = {
            id: reqId,
            agentId: agent.id,
            agentName: agent.name,
            actionType: 'ORDER_CANCEL',
            targetEntity: 'Active Order',
            targetEntityId: mockOrder.id,
            requestDetails: `Cancel active order ${mockOrder.orderNumber || 'AURA-29831'} ($${mockOrder.grandTotal}) on behalf of user prompt: "${customerQuery}".`,
            customerName: 'Marcus Vance',
            customerEmail: 'customer@example.com',
            proposedData: {
              orderId: mockOrder.id,
              totalRefund: mockOrder.grandTotal,
              cancelReason: 'Customer requested cancellation via AI simulator'
            },
            status: 'PENDING' as const,
            requestedAt: new Date().toISOString()
          };

          db.agentApprovalRequests.unshift(newRequest);
          responseText = `I have verified your order cancellation eligibility. However, executing this cancellation involves a complete order void, which triggers our Admin Approval policy rule. I have logged a formal approval request for the store Administrator. You will receive an automated confirmation as soon as it is approved.`;
        }
      }
    } else if (isRefund) {
      steps.push(`[Step 3] Parsing Intent: Refund Processing requested.`);
      if (agent.id !== 'agent_return_refund' && agent.id !== 'agent_supervisor') {
        steps.push(`[Step 4] Access Control Violation: Agent "${agent.name}" does not possess Refund management tools.`);
        permissionSufficient = false;
        responseText = `Access Denied: Return and Refund actions are strictly restricted to the Return & Refund Agent. Please select the correct agent.`;
      } else {
        steps.push(`[Step 4] Tool Access Approved: Return & Refund Agent contains "initiate_draft_refund" in its allowed actions.`);
        steps.push(`[Step 5] Checking Audit & Approval Rulebook...`);

        if (agent.permissionLevel === 'READ_ONLY' || agent.permissionLevel === 'ASSIST') {
          steps.push(`[Step 6] Execution Blocked: Current permission level (${agent.permissionLevel}) is insufficient for initiating refunds.`);
          permissionSufficient = false;
          responseText = `My tools indicate you are eligible for a return, but my restricted permission level (${agent.permissionLevel}) prevents me from writing records to our payment ledger. Please request an Admin to raise my permissions.`;
        } else {
          steps.push(`[Step 6] Approval Rule Triggered: Refund release of high value requires explicit Administrator approval.`);
          approvalNeeded = true;
          
          const mockOrder = db.orders[0] || { id: 'ord_1', orderNumber: 'AURA-29831', grandTotal: 249.00 };
          const reqId = 'req_' + Date.now();
          approvalCreatedId = reqId;

          const newRequest = {
            id: reqId,
            agentId: agent.id,
            agentName: agent.name,
            actionType: 'REFUND_INITIATE',
            targetEntity: 'Order Refund',
            targetEntityId: mockOrder.id,
            requestDetails: `Initiate 100% refund of $${mockOrder.grandTotal} for Order ${mockOrder.orderNumber || 'AURA-29831'} on behalf of customer query: "${customerQuery}".`,
            customerName: 'Sophia Chen',
            customerEmail: 'manager@enterprise.com',
            proposedData: {
              refundAmount: mockOrder.grandTotal,
              restockingFeeWaived: true,
              reason: 'Customer initiated return via Chat'
            },
            status: 'PENDING' as const,
            requestedAt: new Date().toISOString()
          };

          db.agentApprovalRequests.unshift(newRequest);
          responseText = `Under our 30-day refund guarantee, you are fully eligible for a return. I have initiated a refund draft of $${mockOrder.grandTotal}. Because this transfers funds back to your original payment method, it has been flagged for Admin review. The request is currently pending.`;
        }
      }
    } else {
      // General informative response (Assist or Read Only)
      steps.push(`[Step 3] Parsing Intent: General inquiry detected.`);
      steps.push(`[Step 4] Tool Check: Safe informative actions. No write-state modifiers requested.`);
      steps.push(`[Step 5] Querying Agent Knowledge Bases...`);
      agent.knowledgeSources.forEach(ks => {
        steps.push(`[Step 6] Read Source: "${ks}" consulted successfully.`);
      });
      steps.push(`[Step 7] Execution Approved: Response constructed.`);
      
      responseText = `Hello! I am your store's ${agent.name}. Based on our catalog guidelines, we offer high-fidelity audio equipment, minimalist fashion apparel, and ergonomic interior layouts. How may I assist you with your purchase choices today?`;
    }

    // Save activity log
    const logId = 'act_' + Date.now();
    const newLog = {
      id: logId,
      agentId: agent.id,
      agentName: agent.name,
      action: isCancellation ? 'Order Cancellation Draft' : isRefund ? 'Refund Draft Creation' : 'Customer FAQ Discussion',
      inputPrompt: customerQuery,
      outputResult: responseText,
      tokensUsed: Math.floor(800 + Math.random() * 600),
      approvalRequired: approvalNeeded,
      status: approvalNeeded ? ('PENDING_APPROVAL' as const) : (permissionSufficient ? ('SUCCESS' as const) : ('REJECTED' as const)),
      timestamp: new Date().toISOString()
    };

    db.agentActivityLogs.unshift(newLog);
    saveDb(db);

    res.json({
      success: true,
      agentResponse: responseText,
      stepOutputs: steps,
      approvalRequired: approvalNeeded,
      approvalId: approvalCreatedId,
      status: newLog.status
    });
  });

  // VITE & PRODUCTION HANDLER //
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise E-Commerce Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
