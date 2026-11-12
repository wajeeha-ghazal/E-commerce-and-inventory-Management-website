import React, { useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchOrderById } from './orderSlice';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isFromHistory = Boolean((location.state as { fromHistory?: boolean } | null)?.fromHistory);

  const { currentOrder, status, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      const idNum = parseInt(orderId, 10);
      if (!isNaN(idNum) && (!currentOrder || currentOrder.id !== idNum)) {
        dispatch(fetchOrderById(idNum));
      }
    }
  }, [orderId, dispatch, currentOrder]);

  if (status === 'loading' && !currentOrder) {
    return (
      <div className="py-5 text-center w-100">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-3">Loading order details...</p>
      </div>
    );
  }

  if (error && !currentOrder) {
    return (
      <div className="py-5 w-100">
        <Alert variant="danger" className="rounded-3 shadow-sm border-0">
          <Alert.Heading>Unable to load order</Alert.Heading>
          <p>{error}</p>
          <Link to="/" className="btn btn-outline-danger btn-sm">
            Back to Home
          </Link>
        </Alert>
      </div>
    );
  }

  const order = currentOrder;
  if (!order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="py-2 py-md-4 w-100 overflow-hidden">
      {/* Header: Checkout Confirmation vs Order History View */}
      {isFromHistory ? (
        <Row className="justify-content-center mb-3">
          <Col xs={12} lg={8} className="d-flex align-items-center gap-3">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-circle d-flex align-items-center justify-content-center border-warm text-dark bg-white shadow-sm"
              style={{ width: '40px', height: '40px', minWidth: '40px' }}
              title="Go Back"
              aria-label="Go Back"
            >
              <i className="bi bi-arrow-left fs-5" />
            </Button>
            <div>
              <h1 className="serif-display h3 text-dark mb-0">Order Details</h1>
              <p className="text-muted small mb-0">Reviewing historical order #{order.id}</p>
            </div>
          </Col>
        </Row>
      ) : (
        <div className="text-center mb-4 mb-md-5 px-2">
          <div
            className="rounded-circle bg-cream border border-warm d-flex align-items-center justify-content-center mx-auto mb-3 text-terracotta shadow-sm"
            style={{ width: '76px', height: '76px', fontSize: '36px' }}
          >
            <i className="bi bi-check2-circle text-success" />
          </div>
          <Badge bg="success" className="px-3 py-2 fs-6 fw-normal mb-2 rounded-pill">
            Order Placed Successfully
          </Badge>
          <h1 className="serif-display h3 h2-md text-dark mb-2">Thank you for your order!</h1>
          <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: '480px' }}>
            We&apos;ve received your order and our artisan team is preparing your handcrafted items.
            A confirmation has been recorded under your account.
          </p>
        </div>
      )}

      <Row className="g-4 justify-content-center">
        <Col xs={12} lg={8}>
          {/* Order Details Card */}
          <Card className="border-warm shadow-sm rounded-3 mb-4 overflow-hidden">
            <Card.Header className="bg-white border-bottom border-warm p-3 p-sm-4">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                <div>
                  <span className="text-muted small d-block">Order Reference</span>
                  <strong className="text-dark fs-5 serif-display">#{order.id}</strong>
                </div>
                <div className="text-sm-end">
                  <span className="text-muted small d-block">Order Date</span>
                  <span className="text-dark small fw-medium">{formattedDate}</span>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-3 p-sm-4">
              <Row className="g-3 mb-4 pb-3 border-bottom border-warm">
                <Col xs={12} sm={6}>
                  <div className="text-muted small mb-1">Status</div>
                  <Badge
                    bg="warning"
                    text="dark"
                    className="text-capitalize px-3 py-2 fs-6 fw-medium border"
                  >
                    {order.status}
                  </Badge>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-muted small mb-1">Delivery Destination</div>
                  <div className="text-dark small fw-medium text-break">
                    <i className="bi bi-geo-alt text-terracotta me-1" />
                    {order.shippingAddress}
                  </div>
                </Col>
              </Row>

              {/* Items List */}
              <h5 className="serif-display text-dark mb-3">Items in This Order</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex flex-wrap flex-sm-nowrap align-items-center justify-content-between gap-2 gap-sm-3 p-2 p-sm-3 bg-cream rounded-3 border border-warm"
                  >
                    <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0 flex-grow-1">
                      <div
                        className="rounded-3 overflow-hidden border border-warm flex-shrink-0"
                        style={{ width: '56px', height: '56px', backgroundColor: '#f5f0ea' }}
                      >
                        <img
                          src={
                            item.product?.imageUrl ||
                            'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&q=80'
                          }
                          alt={item.product?.title || 'Product'}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-grow-1">
                        <Link
                          to={`/products/${item.productId}`}
                          className="text-dark fw-medium text-decoration-none d-block text-truncate small mb-1"
                        >
                          {item.product?.title || `Product #${item.productId}`}
                        </Link>
                        <div className="text-muted small text-nowrap">
                          ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-terracotta fw-bold small text-sm-end text-nowrap ms-auto ms-sm-0 pt-1 pt-sm-0 flex-shrink-0">
                      ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financials Breakdown */}
              <div className="p-3 bg-cream rounded-3 border border-warm">
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Subtotal</span>
                  <span className="text-dark fw-medium">${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-dark fw-medium">${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-3">
                  <span>Shipping</span>
                  <span className="text-success fw-medium">Free</span>
                </div>
                <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top border-warm">
                  <span className="serif-display">Total Paid</span>
                  <span className="text-terracotta">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </Card.Body>

            {!isFromHistory && (
              <Card.Footer className="bg-white border-top border-warm p-3 p-sm-4 text-center">
                <Link
                  to="/"
                  className="btn btn-terracotta px-4 py-2 rounded-3 text-decoration-none fw-medium w-100 w-sm-auto"
                >
                  <i className="bi bi-arrow-left me-2" />
                  Continue Shopping
                </Link>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderConfirmationPage;
