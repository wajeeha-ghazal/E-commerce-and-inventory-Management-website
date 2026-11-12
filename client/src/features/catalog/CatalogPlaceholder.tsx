import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export const CatalogPlaceholder: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="py-2">
      <div className="p-5 mb-4 bg-white rounded-3 border border-warm warm-shadow">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Badge bg="cream-alt" className="text-terracotta border border-warm px-3 py-2 fw-medium">
            Slice 1 Complete: Auth &amp; RBAC Active
          </Badge>
          {isAuthenticated && (
            <Badge bg="success" className="px-3 py-2">
              <i className="bi bi-check2-circle me-1"></i> Session Active ({user?.role})
            </Badge>
          )}
        </div>

        <h1 className="display-5 serif-display fw-normal mb-3 text-dark">
          Artisan Living, Made Mindful.
        </h1>
        <p className="lead text-secondary mb-4" style={{ maxWidth: '640px' }}>
          Explore handcrafted leather, small-batch ceramics, and heirloom-quality goods created by
          master craftspeople around the globe.
        </p>

        <div className="d-flex flex-wrap gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="btn btn-terracotta px-4 py-2">
                <i className="bi bi-person me-2"></i> View My Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-dark px-4 py-2">
                  <i className="bi bi-shield-lock me-2"></i> Admin Portal
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-terracotta px-4 py-2">
                Sign In to Account
              </Link>
              <Link to="/register" className="btn btn-outline-secondary px-4 py-2">
                Register as Customer
              </Link>
            </>
          )}
        </div>
      </div>

      <Row className="g-4">
        <Col md={4}>
          <Card className="border-warm warm-shadow p-3 h-100 bg-white">
            <h5 className="serif-display text-dark">Protected Session</h5>
            <p className="text-secondary small mb-0">
              JWT token is stored in an <code>httpOnly</code> cookie. Session automatically hydrates
              from <code>GET /api/auth/me</code> on page refresh with zero client-side token
              exposure.
            </p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-warm warm-shadow p-3 h-100 bg-white">
            <h5 className="serif-display text-dark">RBAC Protection</h5>
            <p className="text-secondary small mb-0">
              Admin routes are gated via <code>&lt;AdminRoute /&gt;</code> and Express middleware{' '}
              <code>authorizeRoles('admin')</code>. Non-admin users are strictly blocked with a 403
              response.
            </p>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-warm warm-shadow p-3 h-100 bg-white">
            <h5 className="serif-display text-dark">Ready for Slice 2</h5>
            <p className="text-secondary small mb-0">
              Products and categories seeded in Supabase will be connected in Slice 2 with
              server-side filtering, search with <code>Op.iLike</code>, and responsive grid layouts.
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CatalogPlaceholder;
