import React, { useState, useEffect } from 'react';
import { Tab, Nav, Badge, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearAdminError, clearAdminSuccess } from './adminSlice';
import OverviewTab from './components/tabs/OverviewTab';
import ProductsTab from './components/tabs/ProductsTab';
import CategoriesTab from './components/tabs/CategoriesTab';
import OrdersTab from './components/tabs/OrdersTab';
import UsersTab from './components/tabs/UsersTab';

interface AdminTabConfig {
  key: string;
  label: string;
  icon: string;
  count?: number;
}

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, categories, orders, users, error, successMessage } = useAppSelector(
    (state) => state.admin
  );

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Auto-dismiss banners after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAdminSuccess());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearAdminError());
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Dynamic Navigation Configuration
  const adminTabs: AdminTabConfig[] = [
    { key: 'overview', label: 'Overview & Stats', icon: 'bi-speedometer2' },
    { key: 'products', label: 'Products & Stock', icon: 'bi-box-seam', count: products.length },
    { key: 'categories', label: 'Categories', icon: 'bi-tags', count: categories.length },
    { key: 'orders', label: 'Orders', icon: 'bi-receipt', count: orders.length },
    { key: 'users', label: 'Users', icon: 'bi-people', count: users.length },
  ];

  return (
    <div className="py-2 py-md-4 w-100 overflow-hidden">
      {/* Admin Top Banner */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="serif-display h2 text-dark mb-1">Welcome StoreAdmin!</h1>
          <p className="text-secondary small mb-0">
            Platform inventory control, product catalog, orders fulfillment, and user access.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark" className="px-3 py-2 text-white fs-6 fw-normal rounded-pill">
            <i className="bi bi-shield-check text-success me-1" />
            Admin: {user?.email}
          </Badge>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearAdminError())}
          className="rounded-3 shadow-sm border-0 mb-4 d-flex align-items-center gap-2"
        >
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <div>{error}</div>
        </Alert>
      )}

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => dispatch(clearAdminSuccess())}
          className="rounded-3 shadow-sm border-0 mb-4 d-flex align-items-center gap-2"
        >
          <i className="bi bi-check-circle-fill flex-shrink-0" />
          <div>{successMessage}</div>
        </Alert>
      )}

      {/* Admin Tab Navigation & Content */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Nav
          variant="pills"
          className="bg-white border border-warm rounded-3 p-1 mb-4 gap-1 flex-nowrap overflow-x-auto"
        >
          {adminTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  eventKey={tab.key}
                  className="small fw-medium py-2 px-3 text-nowrap rounded-2"
                >
                  <i
                    className={`bi ${tab.icon} me-1 ${isActive ? 'text-white' : 'text-terracotta'}`}
                  />
                  {tab.label}
                  {tab.count !== undefined && ` (${tab.count})`}
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="overview">
            <OverviewTab />
          </Tab.Pane>
          <Tab.Pane eventKey="products">
            <ProductsTab />
          </Tab.Pane>
          <Tab.Pane eventKey="categories">
            <CategoriesTab />
          </Tab.Pane>
          <Tab.Pane eventKey="orders">
            <OrdersTab />
          </Tab.Pane>
          <Tab.Pane eventKey="users">
            <UsersTab />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default AdminDashboardPage;
