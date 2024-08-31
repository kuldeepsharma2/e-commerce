import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
  const [title, setTitle] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('Available');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }

      const storageRef = ref(storage, `product/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track progress if needed
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !instructor || !description || !price || !schedule || !location || !image || !tags || !category) {
      setError('All required fields must be filled out!');
      toast.error('All required fields must be filled out!');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const imageUrl = await handleImageUpload(image);

      const productData = {
        title,
        instructor,
        description,
        enrollmentStatus,
        duration: serverTimestamp(),
        schedule,
        location,
        tags: tags.split(',').map(tag => tag.trim()),
        price,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        image: imageUrl,
        category
      };

      await addDoc(collection(db, 'products'), productData);

      setTitle('');
      setInstructor('');
      setDescription('');
      setEnrollmentStatus('Available');
      setSchedule('');
      setLocation('');
      setTags('');
      setPrice('');
      setImage(null);
      setCategory('');
      setUploading(false);

      navigate('/');
      toast.success('Product added successfully!');

    } catch (error) {
      console.error('Error adding product:', error);
      setUploading(false);
      toast.error('Failed to add product. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">Product Name</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="instructor">Brand Name</label>
          <input
            type="text"
            id="instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter brand name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product description"
            rows="4"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="enrollmentStatus">Enrollment Status</label>
          <select
            id="enrollmentStatus"
            value={enrollmentStatus}
            onChange={(e) => setEnrollmentStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="schedule">Schedule</label>
          <input
            type="datetime-local"
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tags"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Sports">Sports</option>
            <option value="Toys">Toys</option>
            <option value="Health & Beauty">Health & Beauty</option>
            <option value="Automotive">Automotive</option>
            <option value="Furniture">Furniture</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Computers">Computers</option>
            <option value="Garden">Garden</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Pet Supplies">Pet Supplies</option>
            <option value="Music">Music</option>
            <option value="Movies">Movies</option>
            <option value="Video Games">Video Games</option>
            <option value="Baby Products">Baby Products</option>
            <option value="Handmade">Handmade</option>
            <option value="Arts & Crafts">Arts & Crafts</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Stationery">Stationery</option>
            <option value="Grocery">Grocery</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter price"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="image">Product Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white py-2 rounded-lg font-semibold ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
