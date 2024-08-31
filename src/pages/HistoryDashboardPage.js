import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { setEnrolledProducts } from '../store/ProductSlice';
import HistoryDashboard from '../components/HistoryDashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoryDashboardPage = () => {
  const dispatch = useDispatch();
  const enrolledProducts = useSelector((state) => state.products.enrolledProducts);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const productsRef = collection(db, 'buyed-products');
      const q = query(productsRef, where('userId', '==', user.uid), where('buyProductVisibleStatus', '==', true));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            duration: data.duration ? data.duration.toDate().toISOString() : null, // Convert Timestamp to ISO string
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null, // Ensure all Timestamps are converted
          };
        });
        dispatch(setEnrolledProducts(products));
      }, (error) => {
        console.error('Error fetching purchased products:', error);
      });

      return () => unsubscribe();
    }
  }, [dispatch, user]);

  const handleDeleteProduct = async (productBuyId) => {
    if (!user) return;

    try {
      const productRef = doc(db, 'buyed-products', productBuyId);
      await updateDoc(productRef, { buyProductVisibleStatus: false });

      const filteredProducts = enrolledProducts.filter(product => product.productBuyId !== productBuyId);
      dispatch(setEnrolledProducts(filteredProducts));

      toast.success('Product history deleted successfully.');

    } catch (error) {
      console.error('Error deleting product history:', error);
      toast.error('Failed to delete product history. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <HistoryDashboard
        products={enrolledProducts}
        onDeleteProduct={handleDeleteProduct}
      />
      <ToastContainer />
    </div>
  );
};

export default HistoryDashboardPage;
