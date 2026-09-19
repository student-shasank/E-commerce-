import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from '../redux/Slice/authSlice.js'
import collectionsReducer from "../redux/Slice/Collectionsslice.js"
import favoritesReducer from "../redux/Slice/Favoritesslice.js"
export const store = configureStore({
  reducer: {
    cart: cartReducer,
        auth: authReducer,
         collections: collectionsReducer, 
          favorites: favoritesReducer,
        
  },
});
