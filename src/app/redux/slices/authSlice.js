// src/app/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Token storage key
const TOKEN_KEY = 'auth_token';

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

// Attach stored token to axios headers on load
const existingToken = getToken();
if (existingToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

// Thunks
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch }) => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      // attempt to fetch user data
      await dispatch(fetchUserData());
    }
  }
);

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
      const response = await axios.post('/api/client/login', { phoneNumber, password });
      if (response.data.status === 200) {
        const token = response.data.token;
        setToken(token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        return dispatch(fetchUserData()).unwrap();
      }
      return rejectWithValue(response.data.error || 'Login failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async ({ phoneNumber, otpCode }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/api/sms/verify-otp', { phoneNumber, otpCode });
      if (response.data.status === 'approved' && response.data.token) {
        const token = response.data.token;
        setToken(token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        return dispatch(fetchUserData()).unwrap();
      }
      if (response.data.status === 'reset-password') {
        setToken(response.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
        return rejectWithValue('RESET_PASSWORD');
      }
      return rejectWithValue(response.data.error || 'OTP verification failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post('/api/client/signup', userData);
      if (response.data.status === 200) {
        const token = response.data.token;
        setToken(token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        return dispatch(fetchUserData()).unwrap();
      }
      return rejectWithValue(response.data.error || 'Signup failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/client/reset', { password: newPassword });
      if (response.data.status === 200) {
        return true;
      }
      return rejectWithValue(response.data.error || 'Password reset failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null
};

// Slice
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
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
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