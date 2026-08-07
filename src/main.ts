import 'express-async-errors';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { envConfig } from './config/env.config';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

// Importar rotas dos módulos
import authRoutes from './modules/auth/auth.routes';
import requestsRoutes from './modules/requests/requests.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import aprovacoesRoutes from './modules/aprovacoes/aprovacoes.routes';
import viagensRoutes from './modules/viagens/viagens.routes';
import mobilidadeRoutes from './modules/mobilidade/mobilidade.routes';
import correiosRoutes from './modules/correios/correios.routes';
import xeroxRoutes from './modules/xerox/xerox.routes';
import financeiroRoutes from './modules/financeiro/financeiro.routes';
import fornecedoresRoutes from './modules/fornecedores/fornecedores.routes';
import ticketsRoutes from './modules/tickets/tickets.routes';

const app = express();
const PORT = envConfig.port;

// --- R2: Headers de segurança (Helmet) ---
// Configurado para servidor local com arquivos estáticos.
// CSP: 'unsafe-inline' para scripts/estilos é relaxamento documentado para o protótipo.
// Em produção, mover scripts inline para arquivos .js separados.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Relaxamento: protótipo usa scripts inline
      styleSrc: ["'self'", "'unsafe-inline'"],    // Relaxamento: protótipo usa estilos inline
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,       // Protótipo não usa cross-origin resources
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// --- R1: CORS configurável ---
// Ler origens do ambiente. Em desenvolvimento, aceitar localhost.
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sem origin (curl, server-to-server, same-origin)
    if (!origin) return callback(null, true);
    if (envConfig.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Em modo mock/dev, permitir qualquer origem local
    if (envConfig.mockMode && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '100kb' }));

// Servir arquivos estáticos do protótipo
const prototypePath = path.resolve(__dirname, '../prototype');
app.use(express.static(prototypePath));

// Healthcheck público
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    appName: envConfig.appName,
    version: '1.0.0-alpha.2 (Fase 1B)',
    mode: envConfig.mockMode ? 'MOCK_ACTIVE' : 'PRODUCTION',
    mockAuth: envConfig.mockAuth,
    timestamp: new Date().toISOString(),
    modules: [
      'auth',
      'requests',
      'dashboard',
      'aprovacoes',
      'viagens',
      'mobilidade',
      'correios',
      'xerox',
      'financeiro',
      'fornecedores',
      'tickets'
    ]
  });
});

// Rotas públicas (não requerem autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
app.use('/api/requests', authenticate, requestsRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/approvals', authenticate, aprovacoesRoutes);
app.use('/api/viagens', authenticate, viagensRoutes);
app.use('/api/non-flown-tickets', authenticate, viagensRoutes);
app.use('/api/mobilidade', authenticate, mobilidadeRoutes);
app.use('/api/correios', authenticate, correiosRoutes);
app.use('/api/xerox', authenticate, xeroxRoutes);
app.use('/api/finance', authenticate, financeiroRoutes);
app.use('/api/suppliers', authenticate, fornecedoresRoutes);
app.use('/api/tickets', authenticate, ticketsRoutes);

// Rota raiz: redireciona para o protótipo
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(prototypePath, 'index.html'));
});

// SPA fallback: qualquer rota não encontrada retorna o index.html
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: { message: 'Rota da API não encontrada' }
    });
  }
  res.sendFile(path.join(prototypePath, 'index.html'));
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  CENTRAL DE SERVIÇOS 360 - CORE (FASE 1B)`);
    console.log(`  Servidor rodando em http://localhost:${PORT}`);
    console.log(`  Protótipo:  http://localhost:${PORT}/`);
    console.log(`  API:        http://localhost:${PORT}/api/`);
    console.log(`  Health:     http://localhost:${PORT}/health`);
    console.log(`  Modo Mock:  ${envConfig.mockMode ? 'ATIVADO' : 'DESATIVADO'}`);
    console.log(`  Mock Auth:  ${envConfig.mockAuth ? 'ATIVADO' : 'DESATIVADO'}`);
    console.log(`  CORS:       ${envConfig.corsOrigins.join(', ')}`);
    console.log(`  Módulos:    11`);
    console.log(`=======================================================`);
  });
}

export default app;
