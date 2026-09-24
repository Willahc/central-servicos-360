import { Router, Request, Response } from 'express';
import { mockEmployeeProfile, userRepository } from '../../database';
import { AppError } from '../../common/errors/AppError';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { loginSchema } from '../../common/validation-schemas';
import { normalizeLegacyRole } from '../../common/authorization';

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
  if (user.accessStatus === 'DESATIVADO') throw new AppError('Acesso à Central 360 desativado', 401);

  const normalized = normalizeLegacyRole(user.role);
  const authenticatedUser = {
    ...user,
    role: normalized.role,
    serviceScopes: user.serviceScopes || normalized.serviceScopes,
    approvalScopes: user.approvalScopes || (normalized.role === 'ADMINISTRADOR' ? ['ALL'] : normalized.role === 'GESTOR_APROVADOR' ? ['DEMO_ALL'] : [])
  };
  const token = `mock_jwt_token_${user.id}_${authenticatedUser.role}_${Date.now()}`;

  res.json({
    success: true,
    data: {
      user: authenticatedUser,
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
    serviceScopes: req.user?.serviceScopes || [],
    approvalScopes: req.user?.approvalScopes || [],
    name: req.user?.name || 'Usuário Simulado'
    ,employeeId: req.user?.employeeId || 'MAT-USR-001'
    ,department: req.user?.department || 'Área Demonstrativa'
    ,costCenter: req.user?.costCenter || 'CC-DEMO-01'
  };

  res.json({
    success: true,
    data: {
      user,
      authenticated: true
    }
  });
});

router.get('/employee-profile', authenticate, async (req: Request, res: Response) => {
  return res.json({ success: true, data: {
    ...mockEmployeeProfile,
    employeeId: mockEmployeeProfile.matricula,
    sourceType: 'DEMONSTRATIVO',
    notice: 'Dados corporativos preenchidos automaticamente.'
  }});
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
    { id: 'COLABORADOR', name: 'Colaborador', description: 'Portal, catálogo e solicitações próprias.' },
    { id: 'AGENTE_SERVICO', name: 'Agente de Serviço', description: 'Operação limitada às frentes de serviceScopes.' },
    { id: 'GESTOR_APROVADOR', name: 'Gestor Aprovador', description: 'Decisões destinadas à sua alçada.' },
    { id: 'ADMINISTRADOR', name: 'Administrador', description: 'Governança e acesso total com serviceScopes ALL.' }
  ];

  res.json({
    success: true,
    data: roles
  });
});

export default router;
