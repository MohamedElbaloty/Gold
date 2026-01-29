import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import PrivateRoute from './components/PrivateRoute';
import AccountModeChooser from './components/AccountModeChooser';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Wallet from './pages/Wallet';
import Orders from './pages/Orders';
import Delivery from './pages/Delivery';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductDetails from './pages/store/ProductDetails';
import CartPage from './pages/store/CartPage';
import CheckoutPage from './pages/store/CheckoutPage';
import NewsList from './pages/NewsList';
import NewsArticlePage from './pages/NewsArticlePage';
import PricesPage from './pages/PricesPage';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

function CatalogRedirect() {
  const { categorySlug } = useParams();
  return <Navigate to={categorySlug ? `/?catalog=${categorySlug}` : '/'} replace />;
}

function App() {
  return (
    <UiProvider>
      <AuthProvider>
        <AccountModeChooser />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50 dark:bg-brand-bg flex flex-col">
            <Navbar />
            <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:slugOrId" element={<NewsArticlePage />} />
              <Route path="/prices" element={<PricesPage />} />

              <Route path="/store" element={<Navigate to="/" replace />} />
              <Route path="/store/catalog" element={<Navigate to="/" replace />} />
              <Route path="/store/catalog/:categorySlug" element={<CatalogRedirect />} />
              <Route
                path="/store/product/:idOrSlug"
                element={<ProductDetails />}
              />
              <Route
                path="/cart"
                element={<CartPage />}
              />
              <Route
                path="/checkout"
                element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trading"
                element={
                  <PrivateRoute>
                    <Trading />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <PrivateRoute>
                    <Wallet />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/delivery"
                element={
                  <PrivateRoute>
                    <Delivery />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={['admin', 'merchant']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/change-password"
                element={
                  <PrivateRoute>
                    <ChangePassword />
                  </PrivateRoute>
                }
              />
              <Route path="/home" element={<Navigate to="/" replace />} />
            </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </UiProvider>
  );
}

export default App;
