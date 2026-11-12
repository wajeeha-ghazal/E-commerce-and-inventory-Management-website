import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { openCart, selectCartItemCount } from '../../features/cart/cartSlice';
import { useTheme } from '../../app/ThemeContext';

export const MainNavbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const cartItemCount = useAppSelector(selectCartItemCount);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const displayName = user?.profile?.fullName || user?.email || 'User';
  const avatarUrl = user?.profile?.avatarUrl;

  return (
    <Navbar expand="lg" className="bg-white border-bottom border-warm py-3 sticky-top shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <span className="fs-3">🏺</span>
          <span className="h4 mb-0 serif-display text-terracotta fw-semibold">
            Atelier &amp; Co.
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto ms-lg-4">
            <Nav.Link as={Link} to="/" className="text-dark fw-medium px-3">
              Catalog
            </Nav.Link>
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin" className="text-dark fw-medium px-3">
                <i className="bi bi-shield-lock me-1"></i>
                Admin Portal
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              className="rounded-circle d-flex align-items-center justify-content-center p-2 border-warm"
              style={{ width: '36px', height: '36px' }}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              <i
                className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars text-secondary'}`}
                style={{ fontSize: '15px' }}
              ></i>
            </Button>

            {/* Cart Button (Icon only) */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => dispatch(openCart())}
              className="rounded-circle d-flex align-items-center justify-content-center p-2 border-warm text-dark position-relative"
              style={{ width: '36px', height: '36px' }}
              title="View Cart"
              aria-label="View shopping cart"
            >
              <i className="bi bi-cart3 text-dark" style={{ fontSize: '16px' }} />
              {cartItemCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-terracotta text-white"
                  style={{ fontSize: '0.65rem' }}
                >
                  {cartItemCount}
                </span>
              )}
            </Button>

            {isAuthenticated && user ? (
              <div className="d-flex align-items-center gap-3">
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="rounded-circle border border-warm object-fit-cover"
                          style={{ width: '32px', height: '32px' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                          }}
                        />
                      ) : (
                        <span
                          className="rounded-circle bg-cream border border-warm d-inline-flex align-items-center justify-content-center text-terracotta fw-bold"
                          style={{ width: '32px', height: '32px', fontSize: '13px' }}
                        >
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="fw-medium text-dark">{displayName}</span>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Header>
                    Signed in as <strong>{user.email}</strong>
                  </NavDropdown.Header>
                  <NavDropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i> My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    <i className="bi bi-box-seam me-2"></i> Order History
                  </NavDropdown.Item>
                  {user.role === 'admin' && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Header>Management</NavDropdown.Header>
                      <NavDropdown.Item as={Link} to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                      </NavDropdown.Item>
                    </>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-secondary btn-sm px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-terracotta btn-sm px-3">
                  Create Account
                </Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
