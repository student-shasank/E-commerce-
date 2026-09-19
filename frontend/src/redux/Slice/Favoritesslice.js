// redux/favoritesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const toggleFavorite = createAsyncThunk(
  "favorites/toggle",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo?.token) {
        return rejectWithValue("Not authenticated");
      }

      // ALWAYS try ADD first
      try {
        const res = await axios.post(
          `${API_URL}/favorites/add`,
          {
            userId: userInfo._id,
            productId,
          },
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        return res.data.favorites;

      } catch (err) {
        // if already exists → REMOVE instead
        if (
          err.response?.data?.message ===
          "Product already in favorites"
        ) {
          const res = await axios.post(
            `${API_URL}/favorites/remove`,
            {
              userId: userInfo._id,
              productId,
            },
            {
              headers: {
                Authorization: `Bearer ${userInfo.token}`,
              },
            }
          );

          return res.data.favorites;
        }

        throw err;
      }

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong"
      );
    }
  }
);

// 📥 Get Favorites
export const getFavorites = createAsyncThunk(
  "favorites/get",
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      const res = await axios.post(
        `${API_URL}/favorites/get`,
        { userId: userInfo._id },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      return res.data.favorites;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load favorites"
      );
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // toggle
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // get
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

// selectors
export const selectFavorites = (state) => state.favorites.items;
export const selectFavoritesLoading = (state) => state.favorites.loading;

export const selectIsFavorited = (state, productId) =>
  state.favorites.items.some(
    (item) =>
      (item._id && item._id === productId) ||
      item.toString() === productId
  );

export default favoritesSlice.reducer;