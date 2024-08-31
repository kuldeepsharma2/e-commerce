import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useCart } from '../contexts/CartContext';
import { MenuIcon, XIcon } from '@heroicons/react/outline'; // For burger menu icons

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:text-gray-400">Products</Link>
        </h1>
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isMenuOpen ? <XIcon className="h-8 w-8 text-white" /> : <MenuIcon className="h-8 w-8 text-white" />}
          </button>
        </div>
        <nav
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:flex items-center space-x-4 absolute md:relative top-full left-0 w-full md:w-auto bg-gray-800 md:bg-transparent p-4 md:p-0`}
        >
          <Link
            to="/"
            className="block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
            onClick={() => setIsMenuOpen(false)} // Close menu on click
          >
            Products
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              History Dashboard
            </Link>
          )}
          {user ? (
            <Link
              to="/cart"
              className="relative block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              Cart
              {getCartQuantity() > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1 -translate-x-1/2 -translate-y-1/2">
                  {getCartQuantity()}
                </span>
              )}
            </Link>
          ) : (
            <Link
              to="/login"
              className="block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              Login
            </Link>
          )}
          <button
            onClick={() => {
              handleAddProduct();
              setIsMenuOpen(false); // Close menu on click
            }}
            className="block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
          >
            Add Products
          </button>
          {!user ? (
            <Link
              to="/register"
              className="block md:inline-block hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              Register
            </Link>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false); // Close menu on click
              }}
              className="block md:inline-block text-red-500 hover:bg-gray-700 px-3 py-2 rounded transition duration-300"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
