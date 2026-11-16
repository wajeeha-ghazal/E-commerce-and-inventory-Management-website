import React, { useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { fetchAdminStats } from '../../adminSlice';
import { ORDER_STATUSES } from '@ecomm/shared/src/constants';

export const OverviewTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, statsLoading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (statsLoading && !stats) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-2 small">Loading live store statistics...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <Row className="g-3 mb-4">
        {/* Revenue Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Total Revenue</span>
              <div className="p-2 rounded-2 bg-cream text-terracotta">
                <i className="bi bi-cash-stack fs-5" />
              </div>
            </div>
            <h3 className="serif-display text-dark mb-1">
              ${stats.orders.totalRevenue.toFixed(2)}
            </h3>
            <small className="text-muted">{stats.orders.totalOrders} total orders processed</small>
          </Card>
        </Col>

        {/* Active Products */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Active Products</span>
              <div className="p-2 rounded-2 bg-cream text-terracotta">
                <i className="bi bi-box-seam fs-5" />
              </div>
            </div>
            <h3 className="serif-display text-dark mb-1">{stats.inventory.distinctProducts}</h3>
            <small className="text-muted">{stats.inventory.totalUnits} total units in stock</small>
          </Card>
        </Col>

        {/* Low Stock Alerts */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Low Stock Alert (&le; 5)</span>
              <div className="p-2 rounded-2 bg-warning bg-opacity-25 text-warning">
                <i className="bi bi-exclamation-triangle fs-5" />
              </div>
            </div>
            <h3 className="serif-display text-warning mb-1">{stats.inventory.lowStockCount}</h3>
            <small className="text-muted">Items needing replenishment soon</small>
          </Card>
        </Col>

        {/* Out of Stock */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-warm shadow-sm rounded-3 p-3 bg-white h-100 admin-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Out of Stock (0)</span>
              <div className="p-2 rounded-2 bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-x-circle fs-5" />
              </div>
            </div>
            <h3 className="serif-display text-danger mb-1">{stats.inventory.outOfStockCount}</h3>
            <small className="text-muted">Products currently unavailable</small>
          </Card>
        </Col>
      </Row>

      {/* Orders by Status & Users */}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-warm shadow-sm rounded-3 p-4 bg-white h-100 admin-stat-card">
            <h5 className="serif-display text-dark mb-3">Order Status Distribution</h5>
            <div className="d-flex flex-wrap gap-2">
              {ORDER_STATUSES.map((st) => (
                <div
                  key={st}
                  className="p-3 bg-cream rounded-3 border border-warm flex-grow-1 min-w-140 admin-stat-mini-card"
                  style={{ minWidth: '130px' }}
                >
                  <span className="text-capitalize small text-muted d-block mb-1">{st}</span>
                  <span className="fs-4 fw-bold text-dark">{stats.orders.byStatus[st] || 0}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-warm shadow-sm rounded-3 p-4 bg-white h-100 admin-stat-card">
            <h5 className="serif-display text-dark mb-3">User Accounts</h5>
            <div className="p-3 bg-cream rounded-3 border border-warm mb-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="small text-muted">Total Registered Accounts</div>
                <span className="fs-4 fw-bold text-dark">{stats.users.totalUsers}</span>
              </div>
              <i className="bi bi-people fs-3 text-secondary" />
            </div>
            <div className="d-flex gap-2">
              <div className="p-2 bg-white rounded border border-warm flex-grow-1 text-center admin-stat-mini-card">
                <span className="small text-muted d-block">Customers</span>
                <strong>{stats.users.customerCount}</strong>
              </div>
              <div className="p-2 bg-white rounded border border-warm flex-grow-1 text-center admin-stat-mini-card">
                <span className="small text-muted d-block">Admins</span>
                <strong className="text-terracotta">{stats.users.adminCount}</strong>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
