// src/types/auth.types.ts
export interface AuthSession {
  access_token:  string;
  refresh_token: string;
  expires_at?:   number;
  user: {
    id:    string;
    email: string;
  };
}
