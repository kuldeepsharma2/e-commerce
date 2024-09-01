import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [quantity, setQuantity] = useState({});
  const productsPerPage = 9;
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productCollection = await getDocs(collection(db, 'products'));
        const fetchedProducts = productCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
        setTotalPages(Math.ceil(fetchedProducts.length / productsPerPage));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCartItems = async () => {
      if (user) {
        try {
          const cartItemsRef = doc(db, 'carts', user.uid);
          const cartItemsDoc = await getDoc(cartItemsRef);
          if (cartItemsDoc.exists()) {
            setCartItems(Object.values(cartItemsDoc.data() || {}));
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      }
    };

    fetchProducts();
    fetchCartItems();
  }, [user]);

  useEffect(() => {
    const initialQuantity = products.reduce((acc, product) => {
      acc[product.id] = 1;
      return acc;
    }, {});
    setQuantity(initialQuantity);
  }, [products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const updateCartItems = async () => {
    if (user) {
      try {
        const cartItemsRef = doc(db, 'carts', user.uid);
        const cartItemsDoc = await getDoc(cartItemsRef);
        if (cartItemsDoc.exists()) {
          setCartItems(Object.values(cartItemsDoc.data() || {}));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    }
  };

  const handleBuyNow = async (product) => {
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
        const updatedQuantity = (cartData[cartItemId].quantity || 0) + quantity[product.id];
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
            quantity: quantity[product.id],
            cartItemId: cartItemId,
          },
        }, { merge: true });
      }

      toast.success('Item added to cart!', { delay: 9000 }); // Show success toast with 9-second delay
      updateCartItems();
      navigate('/cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Error adding item to cart', { delay: 9000 }); // Show error toast with 9-second delay
    }
  };

  const isProductInCart = (productId) => {
    return cartItems.some(cartItem => cartItem && cartItem.id === productId);
  };

  const handleQuantityChange = (productId, event) => {
    setQuantity({
      ...quantity,
      [productId]: parseInt(event.target.value, 10) || 1,
    });
  };

  const handleProductClick = (product) => {
    navigate('/product-detail', { state: { product } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 shadow-lg flex flex-col justify-between bg-white"
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover mb-4 rounded-md cursor-pointer"
                onClick={() => handleProductClick(product)}
              />
            )}
            <div className="flex-1">
              <h2
                className="text-lg font-semibold cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {product.title}
              </h2>
              <p
                className="text-gray-600 mt-2 line-clamp-2 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {product.description}
              </p>
            </div>
            <div className="mt-3">
              <p className="text-center font-semibold">Price: ${product.price}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center mt-4">
              <input
                type="number"
                value={quantity[product.id] || 1}
                onChange={(e) => handleQuantityChange(product.id, e)}
                className="w-16 text-center border rounded px-2 py-1 mb-2 sm:mb-0 sm:mr-2"
                style={{ pointerEvents: 'all' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow(product);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                {isProductInCart(product.id) ? 'Update Cart' : 'Buy Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {products.length > productsPerPage && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Next
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default ProductListingPage;
