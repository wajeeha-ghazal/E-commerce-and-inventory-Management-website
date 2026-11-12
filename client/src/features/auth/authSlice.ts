import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '../../services/api';
import {
  UserDTO,
  ProfileDTO,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ApiResponse,
  ApiErrorResponse,
} from '@ecomm/shared';

export interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  fieldErrors?: Record<string, string>;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  fieldErrors: undefined,
  isInitialized: false,
};

// 1. Restore session on application load (GET /api/auth/me)
export const fetchMe = createAsyncThunk<UserDTO, void, { rejectValue: { message: string } }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<UserDTO>>('/auth/me');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue({ message: response.data.error.message });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const message = error.response?.data?.error?.message || 'Session expired or unauthenticated';
      return rejectWithValue({ message });
    }
  }
);

// 2. Login User (POST /api/auth/login)
export const loginUser = createAsyncThunk<
  UserDTO,
  LoginInput,
  { rejectValue: { message: string; fields?: Record<string, string> } }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<UserDTO>>('/auth/login', credentials);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({
      message: response.data.error.message,
      fields: response.data.error.fields,
    });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const errorData = error.response?.data?.error;
    return rejectWithValue({
      message: errorData?.message || 'Login failed. Please check your credentials.',
      fields: errorData?.fields,
    });
  }
});

// 3. Register User (POST /api/auth/register)
export const registerUser = createAsyncThunk<
  UserDTO,
  RegisterInput,
  { rejectValue: { message: string; fields?: Record<string, string> } }
>('auth/register', async (input, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<UserDTO>>('/auth/register', input);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({
      message: response.data.error.message,
      fields: response.data.error.fields,
    });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const errorData = error.response?.data?.error;
    return rejectWithValue({
      message: errorData?.message || 'Registration failed. Please try again.',
      fields: errorData?.fields,
    });
  }
});

// 4. Update Profile (PUT /api/auth/me)
export const updateProfile = createAsyncThunk<
  ProfileDTO,
  UpdateProfileInput,
  { rejectValue: { message: string; fields?: Record<string, string> } }
>('auth/updateProfile', async (input, { rejectWithValue }) => {
  try {
    const response = await api.put<ApiResponse<ProfileDTO>>('/auth/me', input);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({
      message: response.data.error.message,
      fields: response.data.error.fields,
    });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const errorData = error.response?.data?.error;
    return rejectWithValue({
      message: errorData?.message || 'Failed to update profile.',
      fields: errorData?.fields,
    });
  }
});

// 5. Logout User (POST /api/auth/logout)
export const logoutUser = createAsyncThunk<void, void>('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore network errors on logout
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.fieldErrors = undefined;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      state.fieldErrors = undefined;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder.addCase(fetchMe.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<UserDTO>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.status = 'idle';
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    });

    // loginUser
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<UserDTO>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.message || 'Login failed';
      state.fieldErrors = action.payload?.fields;
    });

    // registerUser
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<UserDTO>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.message || 'Registration failed';
      state.fieldErrors = action.payload?.fields;
    });

    // updateProfile
    builder.addCase(updateProfile.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<ProfileDTO>) => {
      state.status = 'succeeded';
      if (state.user) {
        state.user.profile = action.payload;
      }
      state.error = null;
      state.fieldErrors = undefined;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.message || 'Failed to update profile';
      state.fieldErrors = action.payload?.fields;
    });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      state.fieldErrors = undefined;
    });
  },
});

export const { clearAuthError, resetAuth } = authSlice.actions;

export default authSlice.reducer;
