import request from 'supertest';
import { app } from '../src/app';
import { sequelize } from '../src/config/database';
import { Product, Category, Order, OrderItem, User } from '../src/db/models';

describe('Admin API & Dashboard Endpoints', () => {
  let adminCookie: string;
  let customerCookie: string;
  let createdProductId: number;
  let createdCategoryId: number;
  let testOrderId: number;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Login as seeded admin
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@ecomm.dev',
      password: 'AdminPass123!',
    });
    adminCookie = adminRes.headers['set-cookie'][0];

    // Login as seeded customer
    const customerRes = await request(app).post('/api/auth/login').send({
      email: 'customer@ecomm.dev',
      password: 'CustomerPass123!',
    });
    customerCookie = customerRes.headers['set-cookie'][0];

    // Create a dummy order for testing admin order updates
    const testProd = await Product.findOne();
    if (testProd) {
      const order = await Order.create({
        userId: customerRes.body.data.id,
        status: 'pending',
        subtotal: 50.0,
        tax: 4.0,
        total: 54.0,
        shippingAddress: '100 Admin Test Way',
      });
      await OrderItem.create({
        orderId: order.id,
        productId: testProd.id,
        quantity: 1,
        unitPrice: 50.0,
      });
      testOrderId = order.id;
    }
  });

  afterAll(async () => {
    // Clean up created resources
    if (testOrderId) {
      await OrderItem.destroy({ where: { orderId: testOrderId } });
      await Order.destroy({ where: { id: testOrderId } });
    }
    if (createdProductId) {
      await Product.destroy({ where: { id: createdProductId }, force: true });
    }
    if (createdCategoryId) {
      await Category.destroy({ where: { id: createdCategoryId } });
    }
    await sequelize.close();
  });

  describe('RBAC Authorization Guard', () => {
    it('should return 401 when accessing admin endpoints without token', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden when a customer attempts to access admin endpoints', async () => {
      const res = await request(app).get('/api/admin/stats').set('Cookie', customerCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/Access forbidden/i);
    });

    it('should allow access to admin endpoints when authenticated as admin', async () => {
      const res = await request(app).get('/api/admin/stats').set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('inventory');
      expect(res.body.data).toHaveProperty('orders');
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data.inventory).toHaveProperty('totalUnits');
      expect(res.body.data.inventory).toHaveProperty('lowStockCount');
      expect(res.body.data.inventory).toHaveProperty('outOfStockCount');
    });
  });

  describe('Category Management', () => {
    const slug = `admin-cat-${Date.now()}`;

    it('should create a new category', async () => {
      const res = await request(app).post('/api/admin/categories').set('Cookie', adminCookie).send({
        name: 'Handmade Jewelry',
        slug,
        description: 'Artisan rings, necklaces and bracelets',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Handmade Jewelry');
      expect(res.body.data.slug).toBe(slug);
      createdCategoryId = res.body.data.id;
    });

    it('should update the category', async () => {
      const res = await request(app)
        .put(`/api/admin/categories/${createdCategoryId}`)
        .set('Cookie', adminCookie)
        .send({
          name: 'Handcrafted Fine Jewelry',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Handcrafted Fine Jewelry');
    });
  });

  describe('Product CRUD & Soft Deletion', () => {
    const sku = `ADM-SKU-${Date.now()}`;

    it('should create a new product under created category', async () => {
      const res = await request(app).post('/api/admin/products').set('Cookie', adminCookie).send({
        categoryId: createdCategoryId,
        title: 'Artisan Silver Ring',
        description: 'Sterling silver hand-hammered ring',
        sku,
        price: 85.0,
        stock: 4, // low stock count
        imageUrl: 'https://example.com/ring.jpg',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Artisan Silver Ring');
      expect(res.body.data.sku).toBe(sku);
      expect(Number(res.body.data.price)).toBe(85.0);
      expect(res.body.data.stock).toBe(4);
      createdProductId = res.body.data.id;
    });

    it('should dynamically update product details', async () => {
      const res = await request(app)
        .put(`/api/admin/products/${createdProductId}`)
        .set('Cookie', adminCookie)
        .send({
          title: 'Artisan Silver Ring (Polished)',
          price: 90.0,
          stock: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Artisan Silver Ring (Polished)');
      expect(Number(res.body.data.price)).toBe(90.0);
      expect(res.body.data.stock).toBe(12);
    });

    it('should soft-delete product and exclude it from customer catalog views', async () => {
      // 1. Admin soft deletes product
      const delRes = await request(app)
        .delete(`/api/admin/products/${createdProductId}`)
        .set('Cookie', adminCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.data.deletedAt).not.toBeNull();

      // 2. Customer catalog search MUST NOT return soft-deleted product
      const catalogRes = await request(app).get(`/api/products/${createdProductId}`);
      expect(catalogRes.status).toBe(404);

      // 3. Admin list with includeDeleted=true MUST return the product
      const adminListRes = await request(app)
        .get('/api/admin/products?includeDeleted=true')
        .set('Cookie', adminCookie);

      expect(adminListRes.status).toBe(200);
      const found = adminListRes.body.data.find((p: any) => p.id === createdProductId);
      expect(found).toBeDefined();
      expect(found.deletedAt).not.toBeNull();
    });

    it('should restore soft-deleted product', async () => {
      const restoreRes = await request(app)
        .patch(`/api/admin/products/${createdProductId}/restore`)
        .set('Cookie', adminCookie);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.success).toBe(true);
      expect(restoreRes.body.data.deletedAt).toBeNull();

      // Verify product is once again visible in customer catalog
      const catalogRes = await request(app).get(`/api/products/${createdProductId}`);
      expect(catalogRes.status).toBe(200);
      expect(catalogRes.body.data.id).toBe(createdProductId);
    });
  });

  describe('Global Order Management', () => {
    it('should list all platform orders with customer and items info', async () => {
      const res = await request(app).get('/api/admin/orders').set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const first = res.body.data[0];
      expect(first).toHaveProperty('user');
      expect(first).toHaveProperty('items');
    });

    it('should filter orders by status', async () => {
      const res = await request(app)
        .get('/api/admin/orders?status=pending')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const order of res.body.data) {
        expect(order.status).toBe('pending');
      }
    });

    it('should update order fulfillment status', async () => {
      const res = await request(app)
        .patch(`/api/admin/orders/${testOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'shipped' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('shipped');
    });
  });

  describe('User Management', () => {
    it('should list all registered users without password hash', async () => {
      const res = await request(app).get('/api/admin/users').set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const user = res.body.data[0];
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('should forbid demoting an admin account to customer', async () => {
      const usersRes = await request(app).get('/api/admin/users').set('Cookie', adminCookie);
      const adminUser = usersRes.body.data.find((u: { role: string }) => u.role === 'admin');
      expect(adminUser).toBeDefined();

      const res = await request(app)
        .patch(`/api/admin/users/${adminUser.id}/role`)
        .set('Cookie', adminCookie)
        .send({ role: 'customer' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toMatch(/cannot be demoted/i);
    });
  });
});
