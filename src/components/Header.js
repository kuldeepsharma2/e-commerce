import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useCart } from '../contexts/CartContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Updated imports for v2

function Header() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { cart } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddProduct = () => {
    if (user) {
      navigate('/AddProduct');
    } else {
      navigate('/login');
    }
  };

  const getCartQuantity = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:text-gray-400">Products</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Products</Link>
            {user && (
              <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded transition duration-300">History Dashboard</Link>
            )}
            {user ? (
              <Link to="/cart" className="relative hover:bg-gray-700 px-3 py-2 rounded transition duration-300">
                Cart
                {getCartQuantity() > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 -translate-x-1/2 -translate-y-1/2">
                    {getCartQuantity()}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/login" className="hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Login</Link>
            )}
            <button
              onClick={handleAddProduct}
              className="hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
            >
              Add Products
            </button>
            {!user ? (
              <Link to="/register" className="hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Register</Link>
            ) : (
              <button onClick={handleLogout} className="text-red-500 hover:bg-gray-700 px-3 py-2 rounded transition duration-300">
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-gray-800 text-white p-4 space-y-4">
          <Link to="/" className="block hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Products</Link>
          {user && (
            <Link to="/dashboard" className="block hover:bg-gray-700 px-3 py-2 rounded transition duration-300">History Dashboard</Link>
          )}
          {user ? (
            <Link to="/cart" className="block relative hover:bg-gray-700 px-3 py-2 rounded transition duration-300">
              Cart
              {getCartQuantity() > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 -translate-x-1/2 -translate-y-1/2">
                  {getCartQuantity()}
                </span>
              )}
            </Link>
          ) : (
            <Link to="/login" className="block hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Login</Link>
          )}
          <button
            onClick={handleAddProduct}
            className="block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
          >
            Add Products
          </button>
          {!user ? (
            <Link to="/register" className="block hover:bg-gray-700 px-3 py-2 rounded transition duration-300">Register</Link>
          ) : (
            <button onClick={handleLogout} className="block text-red-500 hover:bg-gray-700 px-3 py-2 rounded transition duration-300">
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
