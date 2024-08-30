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
  const [tags, setTags] = useState(''); // New state for tags
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate(); // Add navigate hook

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

    if (!title || !instructor || !description || !price || !schedule || !location || !image || !tags) {
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
        duration: serverTimestamp(), // Auto-generating date and time
        schedule,
        location,
        tags: tags.split(',').map(tag => tag.trim()), // Convert tags string to array
        price,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        image: imageUrl,
      };

      await addDoc(collection(db, 'products'), productData);

      // Reset form fields
      setTitle('');
      setInstructor('');
      setDescription('');
      setEnrollmentStatus('Available');
      setSchedule('');
      setLocation('');
      setTags('');
      setPrice('');
      setImage(null);
      setUploading(false);

      

      // Navigate to the Product Listing Page
      navigate('/'); // Adjust the path as needed
      // Display success toast notification
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
          accept="image/*" // Restrict to image files only
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
