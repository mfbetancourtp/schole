import { RouteLocationNormalized } from 'vue-router';
import { PendingEvaluationsService } from '../services/pendingEvaluations.service';
import { usePendingEvaluationsStore } from '../../stores/pendingEvaluations.store';

const pendingEvaluationsService = new PendingEvaluationsService();
const ALLOWED_ROUTES = ['evaluation-teacher.MyEvaluations', 'evaluation-teacher.EvaluationExecution'];

export function evaluationGuard(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (!pendingEvaluationsService.isStudent()) return;
  if (!pendingEvaluationsService.hasRequiredPending()) return;
  if (ALLOWED_ROUTES.includes(to.name as string)) return;

  // Primera carga (desde login o URL directa) → redirigir silenciosamente
  if (!from.name) return { name: ALLOWED_ROUTES[0] };

  // Navegación interna (sidebar, navbar) → mostrar modal y cancelar la navegación
  const store = usePendingEvaluationsStore();
  store.openModal();
  return false;
}
