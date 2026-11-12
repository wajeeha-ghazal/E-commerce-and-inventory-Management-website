import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import OrderHistoryList from './OrderHistoryList';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Row className="justify-content-center py-2">
      <Col xs={12} lg={10}>
        <div className="d-flex align-items-center gap-3 mb-4">
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
            <h1 className="serif-display text-dark mb-1">Order History</h1>
            <p className="text-secondary small mb-0">
              View your past orders, delivery addresses, and live fulfillment status.
            </p>
          </div>
        </div>

        <Card className="border-warm warm-shadow p-3 p-sm-4 bg-white">
          <OrderHistoryList />
        </Card>
      </Col>
    </Row>
  );
};

export default OrderHistoryPage;
