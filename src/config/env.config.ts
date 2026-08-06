import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Central de Serviços 360 CORE',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_dev',
  mockMode: process.env.MOCK_MODE !== 'false',
};
