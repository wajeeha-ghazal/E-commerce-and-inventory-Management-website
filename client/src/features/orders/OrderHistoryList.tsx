import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyOrders } from './orderSlice';
import type { OrderStatus } from '@ecomm/shared';

const STATUS_BADGE_MAP: Record<OrderStatus, { bg: string; text?: string }> = {
  pending: { bg: 'warning', text: 'dark' },
  processing: { bg: 'info', text: 'dark' },
  shipped: { bg: 'primary' },
  delivered: { bg: 'success' },
  cancelled: { bg: 'secondary' },
};

export const OrderHistoryList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { ordersList, listStatus, listError } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (listStatus === 'loading' && ordersList.length === 0) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" variant="secondary" size="sm" className="me-2" />
        <span className="text-muted small">Loading your order history...</span>
      </div>
    );
  }

  if (listError && ordersList.length === 0) {
    return (
      <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-0">
        {listError}
      </Alert>
    );
  }

  if (ordersList.length === 0) {
    return (
      <div className="text-center py-5">
        <div
          className="rounded-circle bg-cream border border-warm d-inline-flex align-items-center justify-content-center mb-3 text-secondary"
          style={{ width: '64px', height: '64px', fontSize: '24px' }}
        >
          <i className="bi bi-box-seam" />
        </div>
        <h5 className="serif-display text-dark mb-2">No Orders Yet</h5>
        <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: '340px' }}>
          You haven&apos;t placed any orders yet. Explore our handcrafted collection to get started.
        </p>
        <Link to="/" className="btn btn-terracotta btn-sm px-4 py-2 rounded-3 text-decoration-none">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {ordersList.map((order) => {
        const badgeStyle = STATUS_BADGE_MAP[order.status] || { bg: 'secondary' };
        const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <Card
            key={order.id}
            className="border-warm rounded-3 bg-cream overflow-hidden shadow-none"
          >
            <Card.Body className="p-3">
              {/* Top Row: Order # + Date + Status + Total */}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-2 mb-2 border-bottom border-warm">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <strong className="serif-display text-dark">Order #{order.id}</strong>
                  <span className="text-muted small">&bull; {formattedDate}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge
                    bg={badgeStyle.bg}
                    text={badgeStyle.text}
                    className="text-capitalize px-2 py-1 fw-medium"
                  >
                    {order.status}
                  </Badge>
                  <span className="fw-bold text-terracotta">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Items Preview + Shipping + Action */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                <div className="min-w-0 flex-grow-1">
                  {order.items && order.items.length > 0 && (
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="rounded border border-warm overflow-hidden flex-shrink-0"
                          style={{ width: '40px', height: '40px', backgroundColor: '#f5f0ea' }}
                          title={item.product?.title || `Product #${item.productId}`}
                        >
                          <img
                            src={
                              item.product?.imageUrl ||
                              'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&q=80'
                            }
                            alt={item.product?.title || 'Product'}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-muted small">+{order.items.length - 3} more</span>
                      )}
                      <span className="text-muted small ms-1">
                        ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                    </div>
                  )}
                  <div className="text-muted small text-truncate">
                    <i className="bi bi-geo-alt text-terracotta me-1" />
                    {order.shippingAddress}
                  </div>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  state={{ fromHistory: true }}
                  className="btn btn-outline-secondary btn-sm border-warm text-nowrap flex-shrink-0 align-self-start align-self-sm-center"
                >
                  View Details <i className="bi bi-chevron-right ms-1" />
                </Link>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderHistoryList;
