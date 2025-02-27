// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ROUTES } from './config/routes';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Loading Spinner
import LoadingSpinner from './components/common/LoadingSpinner';
// Lazy-loaded pages for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Properties = React.lazy(() => import('./pages/property/Properties'));
const PropertyDetails = React.lazy(() => import('./pages/property/PropertyDetails'));
const PropertyCreate = React.lazy(() => import('./pages/property/PropertyCreate'));
const PropertyEdit = React.lazy(() => import('./pages/property/PropertyEdit'));
const Tenants = React.lazy(() => import('./pages/tenant/Tenants'));
const TenantDetails = React.lazy(() => import('./pages/tenant/TenantDetails'));
const Leases = React.lazy(() => import('./pages/lease/Leases'));
const LeaseDetails = React.lazy(() => import('./pages/lease/LeaseDetails'));
const LeaseCreate = React.lazy(() => import('./pages/lease/LeaseCreate'));
const Maintenance = React.lazy(() => import('./pages/maintenance/Maintenance'));
const MaintenanceDetails = React.lazy(() => import('./pages/maintenance/MaintenanceDetails'));
const MaintenanceCreate = React.lazy(() => import('./pages/maintenance/MaintenanceCreate'));
const Payments = React.lazy(() => import('./pages/payment/Payments'));
const PaymentDetails = React.lazy(() => import('./pages/payment/PaymentDetails'));
const Invoices = React.lazy(() => import('./pages/invoice/Invoices'));
const InvoiceDetails = React.lazy(() => import('./pages/invoice/InvoiceDetails'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const { notifications } = useNotifications();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path={ROUTES.LOGIN} element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} />
      <Route path={ROUTES.REGISTER} element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Dashboard />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Property Routes */}
      <Route
        path={ROUTES.PROPERTIES}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Properties />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROPERTY_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PropertyDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROPERTY_CREATE}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PropertyCreate />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROPERTY_EDIT()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PropertyEdit />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Tenant Routes */}
      <Route
        path={ROUTES.TENANTS}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Tenants />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TENANT_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <TenantDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Lease Routes */}
      <Route
        path={ROUTES.LEASES}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Leases />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LEASE_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <LeaseDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LEASE_CREATE}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <LeaseCreate />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Maintenance Routes */}
      <Route
        path={ROUTES.MAINTENANCE}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Maintenance />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MAINTENANCE_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <MaintenanceDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MAINTENANCE_CREATE}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <MaintenanceCreate />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Payment Routes */}
      <Route
        path={ROUTES.PAYMENTS}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Payments />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PAYMENT_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Invoice Routes */}
      <Route
        path={ROUTES.INVOICES}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Invoices />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INVOICE_DETAILS()}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <InvoiceDetails />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Report Routes */}
      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Reports />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Settings />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <Layout user={user} notifications={notifications} onLogout={logout}>
              <Suspense fallback={<LoadingSpinner />}>
                <Notifications />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;