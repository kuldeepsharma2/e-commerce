import { configureStore } from '@reduxjs/toolkit';
import ProductReducer from './ProductSlice'; // Correct slice name

const store = configureStore({
  reducer: {
    products: ProductReducer, // Ensure correct reducer key
  },
});

export default store;
