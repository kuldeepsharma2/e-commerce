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
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Brand Name"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <select
          value={enrollmentStatus}
          onChange={(e) => setEnrollmentStatus(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        >
          <option value="Available">Available</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
        <input
          type="datetime-local"
          placeholder="Schedule"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        >
          <option value="">Select Category</option>
          {/* Add other categories as needed */}
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
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="border p-2 mb-4 w-full"
          required
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className={`bg-blue-500 text-white p-2 rounded ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
