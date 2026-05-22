import { services } from '../../../shared/constant/services';
import { UpdateBaseNoneIdService } from '../../../shared/services/UpdateBaseNoneId.service';

export class UpdateBudgetExpenseExecutionAddExpensesService extends UpdateBaseNoneIdService<any> {
  url = `${services.budget}/admin/execution-of-expenses-new`;
}
