import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from '../redux/Slice/authSlice.js'


export const store = configureStore({
  reducer: {
    cart: cartReducer,
        auth: authReducer,
        
  },
});
