import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Central de Serviços 360 CORE',
  jwtSecret: process.env.JWT_SECRET || 'change_me_local_only',
  mockAuth: process.env.MOCK_AUTH === 'true' || process.env.MOCK_AUTH === undefined,
  mockMode: process.env.MOCK_MODE !== 'false',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://example_user:example_password@localhost:5432/example_db?schema=public'
  }
};
