import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const { product } = location.state || {};
  const [isInCart, setIsInCart] = useState(false);
  
  useEffect(() => {
    const checkCart = async () => {
      if (user && product) {
        try {
          const cartRef = doc(db, 'carts', user.uid);
          const cartDoc = await getDoc(cartRef);
          if (cartDoc.exists()) {
            const cartItems = cartDoc.data();
            setIsInCart(cartItems && cartItems[product.id] ? true : false);
          }
        } catch (error) {
          console.error('Error checking cart:', error);
        }
      }
    };

    checkCart();
  }, [user, product]);

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await setDoc(doc(db, 'carts', user.uid), {
        [product.id]: {
          ...product,
          quantity: 1,
        },
      }, { merge: true });

      alert('Item added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  if (!product) {
    return <div>No product details available.</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-[60%] object-contain mb-4 rounded-md"
        />
      )}
      <p className="text-lg">{product.description}</p>
      <p className="text-lg">Brand: {product.instructor}</p>
      <p className="text-lg">Price: ${product.price}</p>
      <p className="text-lg">Location: {product.location}</p>
      <p className="text-lg">Tags: {product.tags.join(', ')}</p>
      <p className="text-lg">Status: {product.enrollmentStatus}</p>
      
      {/* Specifications as an expandable item */}
      <details className="mt-4">
        <summary className="cursor-pointer text-blue-500">View Specifications</summary>
        <div className="mt-2">
          <p>{product.specifications}</p>
        </div>
      </details>
      
      <div className="mt-4 flex items-center justify-center">
        {isInCart ? (
          <p className="text-red-500 font-semibold">Item already in cart</p>
        ) : (
          <button
            onClick={handleBuyNow}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
