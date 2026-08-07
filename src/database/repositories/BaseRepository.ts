// Repositório base para operações de banco de dados
// Em produção, usar Prisma/TypeORM/Drizzle
// Por agora, usar armazenamento em memória para mocks

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export class BaseRepository<T extends BaseEntity> {
  protected data: Map<string, T> = new Map();

  async findById(id: string): Promise<T | null> {
    return this.data.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  async create(entity: T): Promise<T> {
    this.data.set(entity.id, entity);
    return entity;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const entity = this.data.get(id);
    if (!entity) return null;
    
    const updatedEntity = { ...entity, ...updates, updatedAt: new Date().toISOString() };
    this.data.set(id, updatedEntity as T);
    return updatedEntity as T;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  async count(): Promise<number> {
    return this.data.size;
  }

  generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }
}