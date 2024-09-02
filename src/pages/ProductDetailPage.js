import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const { product } = location.state || {};
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (product) {
        try {
          const reviewsRef = collection(db, 'reviews');
          const q = query(reviewsRef, where('productId', '==', product.id));
          const querySnapshot = await getDocs(q);
          const reviewsList = querySnapshot.docs.map(doc => doc.data());
          setReviews(reviewsList);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      }
    };


    const checkIfInCart = async () => {
      if (user && product) {
        try {
          const cartRef = doc(db, 'carts', user.uid);
          const cartDoc = await getDoc(cartRef);
          const cartData = cartDoc.data() || {};
          const cartItemId = `cart_${product.id}_${user.uid}`;

          if (cartData[cartItemId]) {
            setIsInCart(true);
          } else {
            setIsInCart(false);
          }
        } catch (error) {
          console.error('Error checking cart:', error);
        }
      }
    };

    fetchReviews();
    checkIfInCart();
  }, [product, user]);

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartDoc = await getDoc(cartRef);
      const cartData = cartDoc.data() || {};

      const cartItemId = `cart_${product.id}_${new Date().getTime()}`;

      if (cartData[cartItemId]) {
        const updatedQuantity = (cartData[cartItemId].quantity || 0) + quantity;
        await setDoc(cartRef, {
          [cartItemId]: {
            ...product,
            quantity: updatedQuantity,
            cartItemId: cartItemId,
          },
        }, { merge: true });
      } else {
        await setDoc(cartRef, {
          [cartItemId]: {
            ...product,
            quantity: quantity,
            cartItemId: cartItemId,
          },
        }, { merge: true });
      }

      toast.success('Item added to cart!'); // Show success toast immediately

      setTimeout(() => {
        navigate('/cart');
      }, 8000); // Delay the redirection to the cart page by 8 seconds
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !review) {
      toast.error('Please log in and provide a review.');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        userId: user.uid,
        userEmail: user.email,
        review,
        createdAt: new Date(),
      });

      setReview('');
      toast.success('Review submitted successfully!');
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', product.id));
      const querySnapshot = await getDocs(q);
      const reviewsList = querySnapshot.docs.map(doc => doc.data());
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (!product) {
    return <div className="text-center p-4">No product details available.</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">{product.title}</h1>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-auto object-contain mb-4 rounded-md"
        />
      )}
      <div className="tabs mb-4">
        {/* <button className="tab-button w-full sm:w-auto">Specifications</button>
        <button className="tab-button w-full sm:w-auto">Price</button>
        <button className="tab-button w-full sm:w-auto">Reviews</button> */}
      </div>
      <div className="tab-content">
        <div className="tab-pane active mb-4">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="description">{product.description}</p>
        </div>
        <div className="tab-pane mb-4">
          <h2 className="text-lg font-semibold mb-2">Price</h2>
          <p className="text-green-600 text-xl font-bold">${product.price}</p>
        </div>
        <div className="tab-pane">
          <h2 className="text-lg font-semibold mb-2">Reviews</h2>
          {reviews.length > 0 ? (
            <ul className="space-y-2">
              {reviews.map((review, index) => (
                <li key={index} className="review-item bg-gray-100 p-4 rounded-md">
                  <p><strong>{review.userEmail}:</strong> {review.review}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet.</p>
          )}
          {user && (
            <form onSubmit={handleReviewSubmit} className="review-form mt-4">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here"
                required
                className="border p-2 w-full rounded-md"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 w-full sm:w-auto">
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-center">
          <div className="text-center">
            <label htmlFor="quantity" className="block text-lg font-semibold mb-2">Quantity:</label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="border p-2 w-full sm:w-20 rounded-md"
            />
            <div className="mt-4">
              <button
                onClick={handleBuyNow}
                className="bg-green-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                {isInCart ? 'Update Cart' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ProductDetailPage;
