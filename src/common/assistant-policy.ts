import { ActivePerspective, AuthorizedRole, hasServiceScope, ServiceScope } from './authorization';
import { PolicyDocument, ServiceFront } from './interfaces/service-request.interface';

export const SAFE_POLICY_FALLBACK = 'Não encontrei uma orientação institucional cadastrada para este caso. Consulte a política oficial ou a Central de Serviços.';
export interface AssistantContext {
  role: AuthorizedRole; perspective: ActivePerspective; currentService: ServiceFront; currentPage?: string; currentRequest?: string | null;
  audience: Exclude<PolicyDocument['audience'], 'TODOS'>; serviceScopes: ServiceScope[];
}

export function selectInstitutionalPolicy(policies: PolicyDocument[], context: AssistantContext, now = new Date()): PolicyDocument | null {
  if (!hasServiceScope(context, context.currentService) && !['COLABORADOR', 'GESTOR_APROVADOR'].includes(context.role)) return null;
  const date = now.toISOString().slice(0, 10);
  return policies.find(policy => policy.service === context.currentService && policy.sourceType === 'INSTITUCIONAL' &&
    policy.status === 'VIGENTE' && policy.effectiveFrom <= date && (!policy.effectiveTo || policy.effectiveTo >= date) &&
    (policy.audience === 'TODOS' || policy.audience === context.audience)) || null;
}

export const answerPolicyQuestion = (policies: PolicyDocument[], context: AssistantContext, now?: Date): string =>
  selectInstitutionalPolicy(policies, context, now)?.content || SAFE_POLICY_FALLBACK;
