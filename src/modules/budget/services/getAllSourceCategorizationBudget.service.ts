import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';
import { sourceCategorizationDto } from '../dtos/sourceCategorization.dto';

export class GetAllSourceCategorizationBudgetService {
  async run() {
    return axios.get<sourceCategorizationDto[]>(`${services.budget}/admin/source-categorization`).then((response) => response.data);
  }
}
