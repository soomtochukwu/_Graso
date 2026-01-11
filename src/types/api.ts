// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  occupation?: string;
  description?: string;
  phoneNumber?: string;
  website?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  occupation?: string;
  description?: string;
  phoneNumber?: string;
  website?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  occupation?: string;
  description?: string;
  phoneNumber?: string;
  website?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Hook State Types
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiMutationState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// File Upload Types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  fieldName?: string;
}

export interface UploadProgressState {
  progress: number;
  uploading: boolean;
}

// Environment Types
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
}
