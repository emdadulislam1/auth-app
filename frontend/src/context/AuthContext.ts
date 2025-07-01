import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  loading: boolean;
  isTokenValid: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 