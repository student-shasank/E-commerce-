import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";


// ================= LOGIN THUNK =================

export const loginUser =
  createAsyncThunk(

    "login/loginUser",

    async (userData, thunkAPI) => {

      try {

        const res = await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              userData
            ),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {

          return thunkAPI.rejectWithValue(
            data.message
          );
        }

        // SAVE USER
        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );

        return data;

      } catch (error) {

        return thunkAPI.rejectWithValue(
          "Something went wrong"
        );
      }
    }
  );


// ================= SLICE =================

const loginSlice = createSlice({
  name: "login",

  initialState: {

    user:
      JSON.parse(
        localStorage.getItem("user")
      ) || null,

    loading: false,

    error: null,
  },

  reducers: {

    logout: (state) => {

      state.user = null;

      localStorage.removeItem(
        "user"
      );
    },
  },

  extraReducers: (builder) => {

    builder

      .addCase(
        loginUser.pending,
        (state) => {

          state.loading = true;

          state.error = null;
        }
      )

      .addCase(
        loginUser.fulfilled,
        (state, action) => {

          state.loading = false;

          state.user =
            action.payload;
        }
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload;
        }
      );
  },
});

export const { logout } =
  loginSlice.actions;

export default loginSlice.reducer;