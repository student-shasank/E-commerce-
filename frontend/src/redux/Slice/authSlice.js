import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ================= THUNK =================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      // Save in localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Server Error");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      // 👇 IMPORTANT (same key as login)
      localStorage.setItem("userInfo", JSON.stringify(data));

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Server Error");
    }
  }
);
// ================= SLICE =================

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: JSON.parse(localStorage.getItem("userInfo")) || null,
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("userInfo");
    },
  },

  extraReducers: (builder) => {
  builder

    // ===== LOGIN =====
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // ===== REGISTER =====
    .addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;

      // 👇 yahi missing hota hai usually
      state.user = action.payload;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;