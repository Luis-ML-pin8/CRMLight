import { OpportunityPhase, OpportunityState } from '@/types';

type AllowedStates = Record<OpportunityPhase, OpportunityState[]>;

/**
 * Matriz que define los estados permitidos para cada fase de una oportunidad.
 * Esto centraliza la lógica de negocio y permite aplicarla de forma consistente,
 * por ejemplo, en el formulario de edición para deshabilitar opciones no válidas.
 */
export const allowedStatesMatrix: AllowedStates = {
  'Detección': ['Espera cliente', 'Cancelada'],
  'Comunicación': ['Espera cliente', 'Espera interna', 'Cancelada'],
  'Formalización': ['Espera cliente', 'Espera interna', 'Cancelada'],
  'Oferta': ['Espera cliente', 'Espera interna', 'Cancelada'],
  'Petición': ['Ganada', 'Perdida', 'Cancelada'],
};
