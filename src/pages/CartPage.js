import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase'; // Make sure this points to your firebase configuration
import { doc, getDoc, updateDoc, deleteField, writeBatch } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '../contexts/CartContext'; // Assuming you have a CartContext

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          const items = Object.entries(cartData)
            .filter(([key, item]) => item && item.id)
            .map(([key, item]) => ({ cartItemId: key, ...item }));

          setCartItems(items);

          const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
          setTotalAmount(total);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast.error('Error fetching cart items');
      }
    };

    fetchCartItems();
  }, [user, navigate]);

  const handleRemoveFromCart = async (cartItemId) => {
    if (!user) {
      return;
    }

    try {
      const cartRef = doc(db, 'carts', user.uid);
      await updateDoc(cartRef, {
        [cartItemId]: deleteField(),
      });

      setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
      const updatedTotal = cartItems.reduce((sum, item) => item.cartItemId !== cartItemId ? sum + (item.price || 0) * (item.quantity || 0) : sum, 0);
      setTotalAmount(updatedTotal);

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Error removing item from cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    try {
      const batch = writeBatch(db);

      cartItems.forEach((item) => {
        const productBuyId = uuidv4(); // Generate a unique ID for the purchased product
        const productRef = doc(db, 'buyed-products', productBuyId);

        batch.set(productRef, {
          productBuyId,
          userId: user.uid,
          productId: item.id, // Add the productId to the purchased product data
          buyProductVisibleStatus: true, // Add the buyProductVisibleStatus field
          ...item,
          duration: item.duration || null, // Ensure duration is saved
          createdAt: item.createdAt || new Date().toISOString(), // Ensure createdAt is saved
          timestamp: new Date().toISOString(),
        });
      });

      const cartRef = doc(db, 'carts', user.uid);
      cartItems.forEach(item => {
        batch.update(cartRef, {
          [item.cartItemId]: deleteField(),
        });
      });

      await batch.commit();

      setCartItems([]);
      setTotalAmount(0);

      clearCart();

      toast.success('Products purchased successfully');

      // Redirect after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000); // 5 seconds delay

    } catch (error) {
      console.error('Error purchasing products:', error);
      toast.error('Error purchasing products');
    }
  };

  if (!user) {
    return <p>Please log in to view your cart.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="flex flex-col gap-4">
          {cartItems.map((item) => (
            <div key={item.cartItemId} className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg p-4">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:w-1/3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex-1 sm:ml-4">
                <h2 className="text-lg font-semibold mb-2">{item.title}</h2>
                <p className="mb-2">{item.description}</p>
                <p className="text-gray-500 mb-2">Price: ${item.price}</p>
                <p className="text-gray-500 mb-4">Quantity: {item.quantity}</p>
                <button
                  onClick={() => handleRemoveFromCart(item.cartItemId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col items-center mt-4 gap-4">
            <h2 className="text-xl font-bold">Total Amount: ${totalAmount}</h2>
            <button
              onClick={handleBuyNow}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center">Your cart is empty.</p>
      )}
      <ToastContainer />
    </div>
  );
}

export default CartPage;
