export interface LoginRequest {
  username: string;
  password: string;
}

export interface VerifyRequest {
  username: string;
  code: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
}
