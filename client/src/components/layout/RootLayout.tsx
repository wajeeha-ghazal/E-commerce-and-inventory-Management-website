import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import MainNavbar from './Navbar';
import CartDrawer from '../../features/cart/CartDrawer';

export const RootLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-cream">
      <MainNavbar />
      <CartDrawer />

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
