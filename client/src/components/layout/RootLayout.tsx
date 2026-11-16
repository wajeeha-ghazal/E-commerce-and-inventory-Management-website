import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Toast, ToastContainer } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import MainNavbar from './Navbar';
import CartDrawer from '../../features/cart/CartDrawer';
import { hideCartAddedToast, selectCartToast } from '../../features/cart/cartSlice';

export const RootLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartToast = useAppSelector(selectCartToast);

  return (
    <div className="d-flex flex-column min-vh-100 bg-cream">
      <MainNavbar />
      <CartDrawer />
      <ToastContainer
        position="top-end"
        containerPosition="fixed"
        className="p-3"
        style={{ zIndex: 1100 }}
      >
        <Toast
          key={cartToast.id}
          show={cartToast.isOpen}
          onClose={() => dispatch(hideCartAddedToast())}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Added to cart</strong>
          </Toast.Header>
          <Toast.Body>Product added to cart successfully.</Toast.Body>
        </Toast>
      </ToastContainer>

      <main className="flex-grow-1 py-4">
        <Container>
          <Outlet />
        </Container>
      </main>

      <footer className="py-4 border-top border-warm text-center text-secondary bg-white mt-auto">
        <Container>
          <p className="mb-1 small">
            © 2026 Atelier &amp; Co. Artisan Goods &amp; Inventory Platform.
          </p>
          {/* <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
            Built with React 18, TypeScript, Redux Toolkit, Express, PostgreSQL, and Sequelize v6.
          </p> */}
        </Container>
      </footer>
    </div>
  );
};

export default RootLayout;
