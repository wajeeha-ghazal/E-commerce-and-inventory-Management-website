import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ProfilePage from '../features/auth/ProfilePage';
import ProductCatalogPage from '../features/products/ProductCatalogPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import CheckoutPage from '../features/orders/CheckoutPage';
import OrderConfirmationPage from '../features/orders/OrderConfirmationPage';
import OrderHistoryPage from '../features/orders/OrderHistoryPage';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import AdminRoute from '../components/routing/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ProductCatalogPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      // Protected Customer & Admin Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'orders',
            element: <OrderHistoryPage />,
          },
          {
            path: 'orders/:orderId',
            element: <OrderConfirmationPage />,
          },
        ],
      },
      // Admin Only Routes
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
        ],
      },
      // Fallback
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
