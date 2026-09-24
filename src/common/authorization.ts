import { ServiceFront } from './interfaces/service-request.interface';

export type AuthorizedRole = 'COLABORADOR' | 'AGENTE_SERVICO' | 'GESTOR_APROVADOR' | 'ADMINISTRADOR';
export type ActivePerspective = 'collaborator' | 'service-agent' | 'approver' | 'administration';
export type ServiceScope = 'viagens' | 'mobilidade' | 'transportes' | 'correios' | 'entregas' | 'xerox' | 'estacionamento' | 'achados_perdidos' | 'ALL';
export interface AuthorizationContext { role: AuthorizedRole; serviceScopes: ServiceScope[]; }

const PERSPECTIVE_BY_ROLE: Record<AuthorizedRole, ActivePerspective> = {
  COLABORADOR: 'collaborator', AGENTE_SERVICO: 'service-agent', GESTOR_APROVADOR: 'approver', ADMINISTRADOR: 'administration'
};
const SERVICE_TO_SCOPE: Partial<Record<ServiceFront, ServiceScope>> = {
  viagem: 'viagens', mobilidade: 'mobilidade', transporte: 'transportes', correios: 'correios', entregas: 'entregas',
  xerox: 'xerox', estacionamento: 'estacionamento', achados_perdidos: 'achados_perdidos'
};

export const authorizedPerspectives = (roles: AuthorizedRole[]): ActivePerspective[] =>
  [...new Set(roles.map(role => PERSPECTIVE_BY_ROLE[role]).filter(Boolean))];
export const perspectiveForRole = (role: AuthorizedRole): ActivePerspective => PERSPECTIVE_BY_ROLE[role];
export function resolvePerspective(roles: AuthorizedRole[], requested?: string | null): ActivePerspective {
  const allowed = authorizedPerspectives(roles);
  return requested && allowed.includes(requested as ActivePerspective) ? requested as ActivePerspective : (allowed[0] || 'collaborator');
}
export const scopeForService = (service: ServiceFront): ServiceScope | undefined => SERVICE_TO_SCOPE[service];
export const hasServiceScope = (context: AuthorizationContext, service: ServiceFront): boolean => {
  const scope = scopeForService(service);
  return context.serviceScopes.includes('ALL') || Boolean(scope && context.serviceScopes.includes(scope));
};

export function normalizeLegacyRole(role: string): { role: AuthorizedRole; serviceScopes: ServiceScope[] } {
  const map: Record<string, { role: AuthorizedRole; serviceScopes: ServiceScope[] }> = {
    COLABORADOR: { role: 'COLABORADOR', serviceScopes: [] }, colaborador: { role: 'COLABORADOR', serviceScopes: [] },
    AGENTE_SERVICO: { role: 'AGENTE_SERVICO', serviceScopes: [] }, operador: { role: 'AGENTE_SERVICO', serviceScopes: [] },
    viagens: { role: 'AGENTE_SERVICO', serviceScopes: ['viagens', 'mobilidade'] },
    transportes: { role: 'AGENTE_SERVICO', serviceScopes: ['transportes'] },
    faturamento: { role: 'AGENTE_SERVICO', serviceScopes: ['correios', 'entregas', 'xerox'] },
    financeiro: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] }, auditoria: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] },
    GESTOR_APROVADOR: { role: 'GESTOR_APROVADOR', serviceScopes: [] }, gestor: { role: 'GESTOR_APROVADOR', serviceScopes: [] }, gerencia: { role: 'GESTOR_APROVADOR', serviceScopes: [] },
    ADMINISTRADOR: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] }, administrador: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] },
    coordenacao: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] }, coordenadora: { role: 'ADMINISTRADOR', serviceScopes: ['ALL'] }
  };
  return map[role] || map.colaborador;
}
