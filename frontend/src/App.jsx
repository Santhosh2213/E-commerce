import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import HomePage from './pages/customer/HomePage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetail from './pages/customer/ProductDetail';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderHistory from './pages/customer/OrderHistory';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/ProductsManagement';
import VendorOrders from './pages/vendor/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVendors from './pages/admin/VendorApprovals';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Customer routes */}
              <Route element={<PrivateRoute allowedRoles={['customer', 'vendor', 'admin']} />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderHistory />} />
              </Route>
              
              {/* Vendor routes */}
              <Route element={<PrivateRoute allowedRoles={['vendor']} />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/products" element={<VendorProducts />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/vendors" element={<AdminVendors />} />
              </Route>
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;