// API Response Types
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface OfframpRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Form State Types
export interface AuthFormData {
  email: string;
  password: string;
}

export interface AuthFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// API Client Types
export interface ApiClientConfig {
  baseUrl: string;
  frontendKey: string;
}
