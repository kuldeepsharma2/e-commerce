import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { setEnrolledProducts } from '../store/ProductSlice'; // Ensure correct slice

const HistoryDashboard = ({ products, onDeleteProduct }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Product History</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li
              key={`${product.id}-${product.timestamp}`} // Ensure unique key
              className="mb-4 p-4 border rounded"
            >
              <h3 className="text-lg font-semibold">{product.title}</h3>
              <p>{product.description}</p>
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete History
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const HistoryDashboardPage = () => {
  const dispatch = useDispatch();
  const enrolledProducts = useSelector((state) => state.products.enrolledProducts); // Ensure correct state name
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);

      const unsubscribe = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        if (data) {
          const productData = data.products || [];
          console.log('Fetched products:', productData); // Debugging line
          dispatch(setEnrolledProducts(productData));
        } else {
          console.log('No data found for this user.');
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
      });

      return () => unsubscribe();
    }
  }, [dispatch, user]);

  const handleDeleteProduct = async (productId) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const products = userDoc.data()?.products || [];
        const updatedProducts = products.map(product =>
          product.id === productId ? { ...product, deleted: true } : product
        );

        await updateDoc(userRef, { products: updatedProducts });

        // Filter out the deleted product from the local state
        const filteredProducts = enrolledProducts.filter(product => product.id !== productId);
        dispatch(setEnrolledProducts(filteredProducts));

        alert('Product history deleted.');
      } else {
        console.log('No user document found.');
      }
    } catch (error) {
      console.error('Error deleting product history:', error);
      alert('Failed to delete product history. Please try again.');
    }
  };

  console.log('Enrolled products in state:', enrolledProducts); // Debugging line

  return (
    <div className="container mx-auto mt-8">
      <HistoryDashboard
        products={enrolledProducts} // Ensure correct prop name
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};

export default HistoryDashboardPage;
