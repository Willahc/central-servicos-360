import { Router, Request, Response } from 'express';
import { userRepository } from '../../database';
import { AppError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginSchema } from '../../common/validation-schemas';

const router = Router();

// POST /api/auth/login - Login simulado
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, role } = req.body;

  let user;
  if (email) {
    user = await userRepository.findByEmail(email);
  } else if (role) {
    const users = await userRepository.findByRole(role);
    user = users[0];
  }

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const token = `mock_jwt_token_${user.id}_${user.role}_${Date.now()}`;

  res.json({
    success: true,
    data: {
      user,
      token,
      expiresIn: 3600
    }
  });
});

// GET /api/auth/session - Obter sessão ativa (protegido com authenticate)
router.get('/session', authenticate, async (req: Request, res: Response) => {
  // Retornar usuário baseado no token decodificado
  const user = {
    id: req.user?.id || 'USR-001',
    email: req.user?.email || 'colaborador@ficticio.org',
    role: req.user?.role || 'colaborador',
    name: req.user?.name || 'Usuário Simulado'
  };

  res.json({
    success: true,
    data: {
      user,
      authenticated: true
    }
  });
});

// POST /api/auth/logout - Encerrar sessão
router.post('/logout', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sessão encerrada com sucesso'
  });
});

// GET /api/auth/roles - Listar perfis disponíveis
router.get('/roles', async (req: Request, res: Response) => {
  const roles = [
    { id: 'colaborador', name: 'Colaborador (Solicitante)', description: 'Acesso ao catálogo, solicitações próprias, histórico e chatbot.' },
    { id: 'gestor', name: 'Gestor Aprovador', description: 'Aprovação de solicitações de subordinados conforme alçadas.' },
    { id: 'viagens', name: 'Operador de Viagens (Simulado)', description: 'Operacionalização de voos, hotéis, seguro e bilhetes não voados.' },
    { id: 'faturamento', name: 'Faturamento e Apoio Operacional (Simulado)', description: 'Gestão de mobilidade, faturas, correios e conciliação.' },
    { id: 'coordenadora', name: 'Coordenadora (Simulado)', description: 'Acompanhamento tático, SLA, exceções e escalonamento.' },
    { id: 'gerencia', name: 'Gerência (Simulado)', description: 'Indicadores estratégicos e relatórios consolidados.' },
    { id: 'financeiro', name: 'Financeiro', description: 'Consolidação por centro de custo, faturas e carga de despesas.' },
    { id: 'administrador', name: 'Administrador', description: 'Parametrizações, gestão de perfis e reset de demonstração.' },
    { id: 'auditoria', name: 'Auditoria', description: 'Trilha auditável de eventos e conformidade do sistema.' }
  ];

  res.json({
    success: true,
    data: roles
  });
});

export default router;
