// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailsPage from './pages/ProductDetailPage';
import HistoryDashboardPage from './pages/HistoryDashboardPage';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './pages/AddProduct';
import Header from './components/Header';
import Footer from './components/Footer'; // Import Footer
import PrivateRoute from './components/PrivateRoute';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-16 pb-16"> {/* Adjust padding to account for header and footer heights */}
            <Routes>
              <Route path="/" element={<ProductListingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/product-detail" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                 <HistoryDashboardPage />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
