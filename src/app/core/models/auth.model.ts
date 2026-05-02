export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
