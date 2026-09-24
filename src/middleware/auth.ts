import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../common/errors/AppError';
import { userRepository } from '../database';
import { AuthorizedRole, ServiceScope, normalizeLegacyRole } from '../common/authorization';
import { ServiceFront } from '../common/interfaces/service-request.interface';
import { hasServiceScope } from '../common/authorization';
import { envConfig } from '../config/env.config';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  serviceScopes: ServiceScope[];
  approvalScopes: string[];
  name: string;
  employeeId: string;
  department: string;
  costCenter: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * MOCK_AUTH: Simula decodificação de JWT.
 *
 * ABORDAGEM A (adotada): MOCK_AUTH=true
 * - Aceita qualquer token Bearer não vazio
 * - Decodifica payload do formato mock: mock_jwt_token_${userId}_${timestamp}
 * - Retorna usuário fixo baseado no token
 * - LIMITADO À DEMONSTRAÇÃO LOCAL
 *
 * ABORDAGEM B (não implementada nesta etapa):
 * - JWT real com jsonwebtoken library
 * - Validação de assinatura e expiração
 * - Integração futura com SSO corporativo
 *
 * NÃO implementar Azure AD, Keycloak, SAML ou OAuth corporativo nesta etapa.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!envConfig.mockAuth) {
    throw new UnauthorizedError('Autenticação real ainda não configurada');
  }
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token de autenticação não fornecido');
  }

  // Mock: decodificar token simulado
  try {
    // Formatos suportados:
    // Novo: mock_jwt_token_${userId}_${role}_${timestamp}
    // Legado: mock_jwt_token_${userId}_${timestamp}
    const VALID_ROLES = ['COLABORADOR', 'AGENTE_SERVICO', 'GESTOR_APROVADOR', 'ADMINISTRADOR', 'colaborador', 'gestor', 'operador', 'coordenacao', 'viagens', 'transportes', 'faturamento', 'coordenadora', 'gerencia', 'financeiro', 'administrador', 'auditoria'];
    let userId: string;
    let role = 'colaborador';
    const currentFormat = token.match(/^mock_jwt_token_([^_]+)_(.+)_(\d+)$/);
    const legacyFormat = token.match(/^mock_jwt_token_([^_]+)_(\d+)$/);
    if (currentFormat) {
      userId = currentFormat[1];
      role = VALID_ROLES.includes(currentFormat[2]) ? currentFormat[2] : 'colaborador';
    } else if (legacyFormat) {
      userId = legacyFormat[1];
    } else {
      throw new UnauthorizedError('Token inválido');
    }

    // Lookup real user from repository to get correct email/name
    const repoUser = await userRepository.findById(userId);
    if (repoUser?.accessStatus === 'DESATIVADO') throw new UnauthorizedError('Acesso à Central 360 desativado');
    const normalized = normalizeLegacyRole(repoUser?.role || role);
    const mockUser: AuthUser = {
      id: userId,
      email: repoUser?.email || 'colaborador@ficticio.org',
      role: normalized.role,
      serviceScopes: (repoUser?.serviceScopes || normalized.serviceScopes) as ServiceScope[],
      approvalScopes: repoUser?.approvalScopes || (normalized.role === 'ADMINISTRADOR' ? ['ALL'] : normalized.role === 'GESTOR_APROVADOR' ? ['DEMO_ALL'] : []),
      name: repoUser?.name || 'Usuário Simulado'
      ,employeeId: `MAT-${userId}`
      ,department: repoUser?.department || 'Área Demonstrativa'
      ,costCenter: repoUser?.costCenter || 'CC-DEMO-01'
    };

    req.user = mockUser;
    next();
  } catch (error) {
    throw new UnauthorizedError('Token inválido');
  }
}

/**
 * Middleware de autorização por perfil.
 *
 * MATRIZ DE AUTORIZAÇÃO (regra funcional de demonstração):
 *
 * | Endpoint                           | Roles Permitidos                              |
 * |------------------------------------|-----------------------------------------------|
 * | GET /api/*                         | Todos autenticados                            |
 * | POST /api/auth/login               | Público                                        |
 * | GET /api/auth/session               | Todos autenticados                            |
 * | GET /api/auth/roles                 | Público                                        |
 * | POST /api/requests                  | colaborador, administrador                     |
 * | PUT /api/requests/:id/submit        | colaborador, administrador                     |
 * | PUT /api/approvals/:id/approve      | gestor, coordenadora, administrador            |
 * | PUT /api/approvals/:id/reject       | gestor, coordenadora, administrador            |
 * | POST /api/mobilidade/access-requests| colaborador, administrador                     |
 * | POST /api/mobilidade/voucher        | colaborador, administrador                     |
 * | POST /api/correios                  | colaborador, administrador                     |
 * | POST /api/xerox/jobs               | colaborador, administrador                     |
 * | PUT /api/xerox/jobs/:id/file        | colaborador, administrador                     |
 * | POST /api/tickets                   | Todos autenticados                            |
 * | PUT /api/tickets/:id/resolve        | faturamento, coordenadora, administrador       |
 * | PUT /api/tickets/:id/escalate       | Todos autenticados                            |
 * | POST /api/finance/export            | financeiro, administrador                      |
 * | GET /api/suppliers                  | Todos autenticados                            |
 *
 * NOTA: Esta matriz é uma regra funcional de demonstração,
 * NÃO é RBAC institucional definitivo.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const allowedCanonical = allowedRoles.map(role => normalizeLegacyRole(role).role);
    if (!allowedCanonical.includes(req.user.role as AuthorizedRole)) {
      throw new ForbiddenError('Perfil de usuário não autorizado para esta ação');
    }

    next();
  };
}

export function authorizeService(service: ServiceFront) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Usuário não autenticado');
    if (req.user.role !== 'ADMINISTRADOR' && !hasServiceScope({ role: req.user.role as AuthorizedRole, serviceScopes: req.user.serviceScopes }, service)) {
      throw new ForbiddenError('Vertical fora dos serviceScopes autorizados');
    }
    next();
  };
}
