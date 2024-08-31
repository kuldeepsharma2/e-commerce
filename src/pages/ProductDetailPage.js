import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const { product } = location.state || {};
  const [isInCart, setIsInCart] = useState(false);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  
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

    fetchReviews();
  }, [product]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !review) {
      alert('Please log in and provide a review.');
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
      alert('Review submitted successfully!');
      // Fetch reviews again to include the new review
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', product.id));
      const querySnapshot = await getDocs(q);
      const reviewsList = querySnapshot.docs.map(doc => doc.data());
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
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
      <div className="tabs">
        <button className="tab-button">Specifications</button>
        <button className="tab-button">Price</button>
        <button className="tab-button">Reviews</button>
      </div>
      <div className="tab-content">
        <div className="tab-pane active">
          <h2>Specifications</h2>
          <p>{product.specifications}</p>
        </div>
        <div className="tab-pane">
          <h2>Price</h2>
          <p>${product.price}</p>
        </div>
        <div className="tab-pane">
          <h2>Reviews</h2>
          {reviews.length > 0 ? (
            <ul>
              {reviews.map((review, index) => (
                <li key={index} className="review-item">
                  <p><strong>{review.userEmail}:</strong> {review.review}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reviews yet.</p>
          )}
          {user && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here"
                required
                className="border p-2 w-full"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
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
