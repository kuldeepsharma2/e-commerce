import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const cartRef = doc(db, 'carts', currentUser.uid);

        const unsubscribeCart = onSnapshot(cartRef, (cartSnapshot) => {
          const cartData = cartSnapshot.data();
          if (cartData) {
            const cartItems = Object.values(cartData).filter(item => item && item.id);
            setCart(cartItems);
          } else {
            setCart([]);
          }
        });

        return () => unsubscribeCart();
      } else {
        setCart([]);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const addItemToCart = async (item) => {
    const user = auth.currentUser;

    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      const cartDoc = await getDoc(cartRef);
      const cartData = cartDoc.data();

      let updatedCart = [];
      let updatedItem = { ...item, timestamp: new Date().toISOString() };

      if (cartData) {
        updatedCart = Object.values(cartData);
        const existingItemIndex = updatedCart.findIndex(cartItem => cartItem.id === item.id);

        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex].quantity += item.quantity;
          updatedCart[existingItemIndex].totalAmount = updatedCart[existingItemIndex].quantity * item.price;
          updatedCart[existingItemIndex].timestamp = updatedItem.timestamp;
        } else {
          updatedCart.push({ ...updatedItem, totalAmount: item.quantity * item.price });
        }
      } else {
        updatedCart = [{ ...updatedItem, totalAmount: item.quantity * item.price }];
      }

      const cartObject = updatedCart.reduce((acc, cartItem, index) => {
        acc[`item_${index}`] = cartItem;
        return acc;
      }, {});

      try {
        await updateDoc(cartRef, cartObject);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }
  };

  const removeItemFromCart = async (itemId) => {
    const user = auth.currentUser;

    if (user) {
      const cartRef = doc(db, 'carts', user.uid);

      try {
        await updateDoc(cartRef, {
          [itemId]: deleteField()
        });

        // Update local state
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };

  const clearCart = async () => {
    const user = auth.currentUser;

    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      try {
        await updateDoc(cartRef, {});
        setCart([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItemToCart, removeItemFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
