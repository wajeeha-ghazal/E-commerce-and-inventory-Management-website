import request from 'supertest';
import { app } from '../src/app';
import { sequelize } from '../src/config/database';
import { User, Product, Order, OrderItem } from '../src/db/models';

describe('Orders & Checkout API', () => {
  let customerCookie: string;
  let customerUser: any;
  let testProduct1: Product;
  let testProduct2: Product;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Login as seeded customer
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'customer@ecomm.dev',
      password: 'CustomerPass123!',
    });
    customerCookie = loginRes.headers['set-cookie'][0];
    customerUser = loginRes.body.data;

    // Create two test products for deterministic inventory tests
    testProduct1 = await Product.create({
      categoryId: 1,
      title: 'Order Test Ceramic Bowl',
      description: 'Handmade ceramic bowl for testing',
      sku: `TEST-BOWL-${Date.now()}`,
      price: 25.0,
      stock: 5,
      imageUrl: 'https://example.com/bowl.jpg',
    });

    testProduct2 = await Product.create({
      categoryId: 1,
      title: 'Order Test Wooden Spoon',
      description: 'Handmade wooden spoon for testing',
      sku: `TEST-SPOON-${Date.now()}`,
      price: 15.0,
      stock: 10,
      imageUrl: 'https://example.com/spoon.jpg',
    });
  });

  afterAll(async () => {
    // Clean up created test products and their order items/orders
    if (testProduct1 && testProduct2) {
      const orderItems = await OrderItem.findAll({
        where: { productId: [testProduct1.id, testProduct2.id] },
      });
      const orderIds = orderItems.map((oi) => oi.orderId);
      if (orderIds.length > 0) {
        await OrderItem.destroy({ where: { orderId: orderIds } });
        await Order.destroy({ where: { id: orderIds } });
      }
      await Product.destroy({
        where: { id: [testProduct1.id, testProduct2.id] },
        force: true,
      });
    }
    await sequelize.close();
  });

  it('should return 401 when checkout is attempted without authentication', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: testProduct1.id, quantity: 1 }],
        shippingAddress: '123 Market St, San Francisco, CA',
      });

    expect(res.status).toBe(401);
  });

  it('should return 400 when items or shipping address is missing/invalid', async () => {
    const res = await request(app).post('/api/orders').set('Cookie', customerCookie).send({
      items: [],
      shippingAddress: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject order with 409 when requested quantity exceeds available stock and rollback stock', async () => {
    const initialStock = testProduct1.stock;

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        items: [{ productId: testProduct1.id, quantity: initialStock + 10 }],
        shippingAddress: '789 Maple Rd, Seattle, WA 98101',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/insufficient stock/i);

    // Verify stock did not decrement
    await testProduct1.reload();
    expect(testProduct1.stock).toBe(initialStock);
  });

  it('should successfully place order, calculate subtotal/tax/total using DB prices, and decrement stock', async () => {
    const qty1 = 2;
    const qty2 = 1;
    const initialStock1 = testProduct1.stock;
    const initialStock2 = testProduct2.stock;

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        items: [
          // Client sends unordered IDs to test sorting
          { productId: testProduct2.id, quantity: qty2, clientPriceTamper: 0.01 },
          { productId: testProduct1.id, quantity: qty1, clientPriceTamper: 0.01 },
        ],
        shippingAddress: '456 Oak Avenue, Apt 2B, Denver, CO 80202',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const order = res.body.data;
    expect(order.id).toBeDefined();
    expect(order.userId).toBe(customerUser.id);
    expect(order.shippingAddress).toBe('456 Oak Avenue, Apt 2B, Denver, CO 80202');
    expect(order.status).toBe('pending');

    // Expected financials: (2 * 25.0) + (1 * 15.0) = 65.0
    // Tax (8%): round(65.0 * 0.08, 2) = 5.20
    // Total: 65.0 + 5.20 = 70.20
    expect(Number(order.subtotal)).toBe(65.0);
    expect(Number(order.tax)).toBe(5.2);
    expect(Number(order.total)).toBe(70.2);

    // Verify stock decremented
    await testProduct1.reload();
    await testProduct2.reload();
    expect(testProduct1.stock).toBe(initialStock1 - qty1);
    expect(testProduct2.stock).toBe(initialStock2 - qty2);

    // Verify order items were created with correct unit prices from DB
    expect(order.items).toHaveLength(2);
    const item1 = order.items.find((i: any) => i.productId === testProduct1.id);
    const item2 = order.items.find((i: any) => i.productId === testProduct2.id);
    expect(Number(item1.unitPrice)).toBe(25.0);
    expect(Number(item2.unitPrice)).toBe(15.0);
  });

  it('should maintain idempotency when duplicate order requests are submitted with same Idempotency-Key', async () => {
    const idempotencyKey = `idemp-test-${Date.now()}`;
    const initialStock1 = testProduct1.stock;

    // First request
    const res1 = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        items: [{ productId: testProduct1.id, quantity: 1 }],
        shippingAddress: 'Idempotency Test Address, Portland, OR',
      });

    expect(res1.status).toBe(201);
    const order1 = res1.body.data;

    // Stock should have decremented by 1
    await testProduct1.reload();
    expect(testProduct1.stock).toBe(initialStock1 - 1);

    // Second request with SAME idempotency key
    const res2 = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        items: [{ productId: testProduct1.id, quantity: 1 }],
        shippingAddress: 'Idempotency Test Address, Portland, OR',
      });

    // Should return the exact same order without double decrementing stock
    expect(res2.status).toBe(201);
    expect(res2.body.data.id).toBe(order1.id);

    await testProduct1.reload();
    expect(testProduct1.stock).toBe(initialStock1 - 1);
  });

  it('should handle 2 concurrent orders cleanly without deadlocking', async () => {
    // Both orders request products in opposite order
    const req1 = request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        items: [
          { productId: testProduct1.id, quantity: 1 },
          { productId: testProduct2.id, quantity: 1 },
        ],
        shippingAddress: 'Concurrent 1 Address',
      });

    const req2 = request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({
        items: [
          { productId: testProduct2.id, quantity: 1 },
          { productId: testProduct1.id, quantity: 1 },
        ],
        shippingAddress: 'Concurrent 2 Address',
      });

    const [res1, res2] = await Promise.all([req1, req2]);
    expect([201, 409]).toContain(res1.status);
    expect([201, 409]).toContain(res2.status);
  });

  it('should retrieve placed order via GET /api/orders/:id', async () => {
    const listRes = await request(app).get('/api/orders').set('Cookie', customerCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const firstOrderId = listRes.body.data[0].id;
    const singleRes = await request(app)
      .get(`/api/orders/${firstOrderId}`)
      .set('Cookie', customerCookie);

    expect(singleRes.status).toBe(200);
    expect(singleRes.body.data.id).toBe(firstOrderId);
    expect(singleRes.body.data.items).toBeDefined();
  });
});
