import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../common/errors/AppError';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
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
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token de autenticação não fornecido');
  }

  // Mock: decodificar token simulado
  try {
    // Formatos suportados:
    // Novo: mock_jwt_token_${userId}_${role}_${timestamp}
    // Legado: mock_jwt_token_${userId}_${timestamp}
    const VALID_ROLES = ['colaborador', 'gestor', 'viagens', 'faturamento', 'coordenadora', 'gerencia', 'financeiro', 'administrador', 'auditoria'];
    const parts = token.split('_');

    let userId = 'USR-001';
    let role = 'colaborador';

    if (parts.length >= 5) {
      // Formato novo: parts[3] = userId, parts[4] = role, parts[5+] = timestamp
      userId = parts[3] || 'USR-001';
      const potentialRole = parts[4];
      role = VALID_ROLES.includes(potentialRole) ? potentialRole : 'colaborador';
    } else if (parts.length === 4) {
      // Formato legado: parts[3] = userId, parts[4] = timestamp
      userId = parts[3] || 'USR-001';
      role = 'colaborador';
    }

    const mockUser: AuthUser = {
      id: userId,
      email: 'colaborador@ficticio.org',
      role: role,
      name: 'Usuário Simulado'
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

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Perfil de usuário não autorizado para esta ação');
    }

    next();
  };
}
