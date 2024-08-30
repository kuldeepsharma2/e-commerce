import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    productList: [],
    enrolledProducts: [],
  },
  reducers: {
    setProducts: (state, action) => {
      state.productList = action.payload;
    },
    setEnrolledProducts: (state, action) => {
      state.enrolledProducts = action.payload;
    },
    updateProductLikes: (state, action) => {
      const { productId, likes } = action.payload;
      const product = state.productList.find(p => p.id === productId);
      if (product) {
        product.likes = likes;
      }
    },
  },
});

export const { setProducts, setEnrolledProducts, updateProductLikes } = productSlice.actions;
export default productSlice.reducer;
