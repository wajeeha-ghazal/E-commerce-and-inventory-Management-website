import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import type { OrderDTO } from '@ecomm/shared';

export interface OrderDetailsModalProps {
  order: OrderDTO | null;
  onHide: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onHide }) => {
  return (
    <Modal show={Boolean(order)} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-bottom border-warm">
        <Modal.Title className="serif-display text-dark h5 mb-0">
          Order #{order?.id} — Items Breakdown
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {order && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-cream rounded-3 border border-warm">
              <div>
                <small className="text-muted d-block">Customer</small>
                <strong>{order.user?.email}</strong>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Status</small>
                <Badge bg="warning" text="dark" className="text-capitalize">
                  {order.status}
                </Badge>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 mb-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center gap-3 p-2 bg-light rounded border border-warm"
                >
                  <div
                    className="rounded overflow-hidden border border-warm flex-shrink-0"
                    style={{ width: '48px', height: '48px', backgroundColor: '#f5f0ea' }}
                  >
                    <img
                      src={
                        item.product?.imageUrl ||
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80'
                      }
                      alt={item.product?.title || 'Product'}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-medium text-dark small text-truncate">
                      {item.product?.title || `Product #${item.productId}`}
                    </div>
                    <small className="text-muted">
                      ${Number(item.unitPrice).toFixed(2)} &times; {item.quantity}
                    </small>
                  </div>
                  <div className="text-terracotta fw-semibold small text-end">
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-cream rounded-3 border border-warm">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Tax (8%)</span>
                <span>${Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2 border-top border-warm">
                <span>Total Paid</span>
                <span className="text-terracotta">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top border-warm">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailsModal;
