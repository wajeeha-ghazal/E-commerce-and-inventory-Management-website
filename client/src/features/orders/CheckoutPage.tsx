import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
} from '../cart/cartSlice';
import { placeOrder } from './orderSlice';

const generateIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `order-idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const tax = useAppSelector(selectCartTax);
  const total = useAppSelector(selectCartTotal);
  const orderStatus = useAppSelector((state) => state.orders.status);
  const orderError = useAppSelector((state) => state.orders.error);

  const [shippingAddress, setShippingAddress] = useState(
    () => user?.profile?.shippingAddress || ''
  );
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey] = useState<string>(() => generateIdempotencyKey());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      setAddressError('Shipping address is required');
      return;
    }
    if (shippingAddress.trim().length < 5) {
      setAddressError('Please provide a complete shipping address (at least 5 characters)');
      return;
    }
    setAddressError(null);

    if (items.length === 0) return;
    if (isSubmitting || orderStatus === 'loading') return;

    setIsSubmitting(true);

    try {
      // Submits ONLY { items: [{ productId, quantity }], shippingAddress }
      // Client prices are completely ignored to prevent tampering
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress.trim(),
        idempotencyKey,
      };

      const resultAction = await dispatch(placeOrder(payload));

      if (placeOrder.fulfilled.match(resultAction)) {
        const createdOrder = resultAction.payload;
        navigate(`/orders/${createdOrder.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-5 text-center w-100">
        <div
          className="rounded-circle bg-cream border border-warm d-flex align-items-center justify-content-center mx-auto mb-4 text-secondary"
          style={{ width: '80px', height: '80px', fontSize: '32px' }}
        >
          <i className="bi bi-cart-x" />
        </div>
        <h2 className="serif-display text-dark mb-3">Your Cart is Empty</h2>
        <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          Looks like you haven't added any items to your cart yet. Explore our handcrafted
          collection to get started.
        </p>
        <Link to="/" className="btn btn-terracotta px-4 py-2 rounded-3 text-decoration-none">
          Explore Handcrafted Goods
        </Link>
      </div>
    );
  }

  const isLoading = isSubmitting || orderStatus === 'loading';

  return (
    <div className="py-2 py-md-4 w-100 overflow-hidden">
      <div className="mb-4">
        <Link
          to="/"
          className="text-muted text-decoration-none small d-inline-flex align-items-center gap-1 mb-2"
        >
          <i className="bi bi-arrow-left" /> Continue Shopping
        </Link>
        <h1 className="serif-display h2 text-dark mb-1">Checkout</h1>
        <p className="text-muted small mb-0">
          Review your order and enter shipping details to finalize your purchase.
        </p>
      </div>

      {orderError && (
        <Alert
          variant="danger"
          className="border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center gap-2"
        >
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0 fs-5" />
          <div>{orderError}</div>
        </Alert>
      )}

      <Row className="g-4">
        {/* Left: Shipping Form */}
        <Col xs={12} lg={7}>
          <Card className="border-warm shadow-sm rounded-3">
            <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4">
              <h5 className="serif-display text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt text-terracotta" />
                Shipping Information
              </h5>
            </Card.Header>
            <Card.Body className="p-3 p-sm-4">
              <Form onSubmit={handleSubmit}>
                {user && (
                  <div className="p-3 bg-cream rounded-3 border border-warm mb-3 small">
                    <div className="d-flex justify-content-between text-muted mb-1">
                      <span>Recipient</span>
                      <strong className="text-dark">{user.profile?.fullName || user.email}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Email</span>
                      <span className="text-dark">{user.email}</span>
                    </div>
                  </div>
                )}

                <Form.Group className="mb-4" controlId="shippingAddress">
                  <Form.Label className="fw-medium text-dark small">
                    Delivery Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter street address, apartment/suite, city, state, and ZIP code..."
                    value={shippingAddress}
                    onChange={(e) => {
                      setShippingAddress(e.target.value);
                      if (addressError) setAddressError(null);
                    }}
                    isInvalid={!!addressError}
                    disabled={isLoading}
                    className="border-warm rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">{addressError}</Form.Control.Feedback>
                  <Form.Text className="text-muted small">
                    Please ensure the address is correct for accurate delivery.
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn-terracotta w-100 py-3 rounded-3 fw-semibold fs-6 d-flex align-items-center justify-content-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill" />
                      <span>Place Order • ${total.toFixed(2)}</span>
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Order Summary */}
        <Col xs={12} lg={5}>
          <Card className="border-warm shadow-sm rounded-3">
            <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4">
              <h5 className="serif-display text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-bag-check text-terracotta" />
                Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </h5>
            </Card.Header>

            <Card.Body className="p-0">
              {/* Items List */}
              <div className="p-3 p-sm-4 max-h-350 overflow-y-auto" style={{ maxHeight: '350px' }}>
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="d-flex align-items-center gap-2 gap-sm-3 py-2 border-bottom border-warm last-border-0"
                  >
                    <div
                      className="rounded-3 overflow-hidden border border-warm flex-shrink-0"
                      style={{ width: '48px', height: '48px', backgroundColor: '#f5f0ea' }}
                    >
                      <img
                        src={
                          item.imageUrl ||
                          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&q=80'
                        }
                        alt={item.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-dark small fw-medium text-truncate">{item.title}</div>
                      <div className="text-muted small text-nowrap">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-dark fw-semibold small text-end flex-shrink-0 ps-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financials Breakdown */}
              <div className="p-3 p-sm-4 bg-cream border-top border-warm rounded-bottom-3">
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Subtotal</span>
                  <span className="text-dark fw-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-dark fw-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-3">
                  <span>Shipping</span>
                  <span className="text-success fw-medium">Free</span>
                </div>
                <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-3 border-top border-warm">
                  <span className="serif-display">Total</span>
                  <span className="text-terracotta">${total.toFixed(2)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;
