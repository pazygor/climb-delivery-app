export enum UserRole {
  SUPER_ADMIN = 1,        // Equipe do SaaS - Acesso total à área administrativa
  RESTAURANT_OWNER = 2,   // Dono do restaurante
  RESTAURANT_MANAGER = 3, // Gerente do restaurante
  RESTAURANT_EMPLOYEE = 4 // Funcionário do restaurante
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  establishmentId?: string; // Opcional para SUPER_ADMIN
  avatar?: string;
  phone?: string;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
