export enum UserRole {
  SUPER_ADMIN = 1,        // Equipe do SaaS - Acesso total à área administrativa
  RESTAURANT_OWNER = 2,   // Dono do restaurante
  RESTAURANT_MANAGER = 3, // Gerente do restaurante
  RESTAURANT_EMPLOYEE = 4 // Funcionário do restaurante
}

export interface User {
  id: number;
  name: string;
  nome: string;
  email: string;
  role: UserRole;
  empresaId: number;
  permissaoId: number;
  establishmentId?: string; // Opcional para SUPER_ADMIN
  avatar?: string;
  foto?: string;
  phone?: string;
  telefone?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
