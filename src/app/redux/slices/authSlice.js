// src/app/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Token storage key
const TOKEN_KEY = 'token'; // Updated to use 'auth_token' for localStorage

// Utility to read token from localStorage
const getToken = () => {

  try {

    return localStorage.getItem(TOKEN_KEY);

  } catch {
    return null;
  }
};

// Utility to write token to localStorage
const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);

  } catch {}
};

// Utility to clear token
const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

// Attach stored token to axios headers on load (client-side only)
const existingToken = typeof window !== 'undefined' ? getToken() : null;
if (existingToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

/* ----------------------------- Thunks ----------------------------- */

// Verify the token by calling your "me" endpoint.
// If valid -> returns user; if not -> rejects and clears state.
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) return rejectWithValue('NO_TOKEN');

      // Header is already set above, but make sure:
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      const { data } = await axios.get('/api/client/signin');
      console.log('Verifying token:', token);
      if (data?.status === 200 && data?.data?.client) {
        return data.data.client;
      }
      return rejectWithValue('INVALID_TOKEN');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || 'VERIFY_FAILED');
    }
  }
);

// Run once on app start; if a token exists, try verifying it.
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    const token = getToken();

    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      await dispatch(verifyToken());
    }
    return true;
  }
);

// Keep a direct fetchUserData if you need to refetch user later (e.g. profile refresh)
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/client/signin');
      if (response.data.status === 200) {
        return response.data.data.client;
      }
      return rejectWithValue('Failed to fetch user data');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, password }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/client/login', { phoneNumber, password });
      if (data?.status === 200 && data?.token) {
        setToken(data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        // Immediately verify to hydrate user
        return await dispatch(verifyToken()).unwrap();
      }
      return rejectWithValue(data?.error || 'Login failed');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || err.message);
    }
  }
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async ({ phoneNumber, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/sms/verify-otp', { phoneNumber, otpCode });
      if (data?.status === 'approved' && data?.token) {
        setToken(data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        return await dispatch(verifyToken()).unwrap();
      }
      if (data?.status === 'reset-password' && data?.token) {
        setToken(data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        return rejectWithValue('RESET_PASSWORD');
      }
      return rejectWithValue(data?.error || 'OTP verification failed');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || err.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/client/signup', userData);
      if (data?.status === 200 && data?.token) {
        setToken(data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        return await dispatch(verifyToken()).unwrap();
      }
      return rejectWithValue(data?.error || 'Signup failed');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || err.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/client/reset', { password: newPassword });
      if (data?.status === 200) return true;
      return rejectWithValue(data?.error || 'Password reset failed');
    } catch (err) {
      return rejectWithValue(err?.response?.data?.error || err.message);
    }
  }
);

/* --------------------------- Slice & State --------------------------- */

const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  initialized: false, // avoid UI flicker while first verify runs
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearToken();
      delete axios.defaults.headers.common.Authorization;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // initialize
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.initialized = true;
      })

      // verify token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // fetch user (manual refresh)
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // login / otp / signup
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginWithOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

// Ensure `initializeAuth` is dispatched on app load
export const initializeAuthOnLoad = () => (dispatch) => {
  dispatch(initializeAuth());
};
