// File: src/components/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Path to Firebase configuration
import { getAuth } from 'firebase/auth';

function ProductDetailPage() {
  // Your existing code...
}

export default ProductDetailPage;
