import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { documentBudgetDto } from '../dtos/documentBudget.dto';

export class GetDocumentsBudgetsService {
  async run(params?: { categoryId: number | null }) {
    return axios
      .get<documentBudgetDto[]>(`${services.budget}/admin/documents-budgets`, {
        params,
      })
      .then((response) => response.data);
  }
}
