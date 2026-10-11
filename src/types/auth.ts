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
  fullName?: string;
  email?: string;
  isSuperAdmin?: boolean;
  role?: string;
}

export interface MyPermissions {
  adminId: string;
  isSuperAdmin: boolean;
  permissionCodes: string[];
}
