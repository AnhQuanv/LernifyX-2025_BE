export interface PayloadJwt {
  sub: string;
  email: string;
  roleName: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
}
