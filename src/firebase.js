// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyCmgVaS2iCS9c29trNezDeoB25GF4oGkAo',
  authDomain: 'e-commerce-cf345.firebaseapp.com',
  projectId: 'e-commerce-cf345',
  storageBucket: 'e-commerce-cf345.appspot.com',
  messagingSenderId: '71995328437',
  appId: '1:71995328437:web:dcc95050fb158f791fbbfc',
  measurementId: 'G-NL3J4P653T'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Authentication
const db = getFirestore(app);
const auth = getAuth(app); 
const storage = getStorage(app);

export { db, auth, storage };
