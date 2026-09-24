import { BaseEntity, BaseRepository } from './BaseRepository';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: string;
  roles?: string[];
  serviceScopes?: string[];
  approvalScopes?: string[];
  accessStatus?: 'ATIVO' | 'DESATIVADO';
  employeeId?: string;
  jobTitle?: string;
  manager?: string;
  lastAccessAt?: string;
  department: string;
  costCenter: string;
}

export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.data.values()).find(user => user.email === email) || null;
  }

  async findByRole(role: string): Promise<User[]> {
    return Array.from(this.data.values()).filter(user => user.role === role);
  }
}
