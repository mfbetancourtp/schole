import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCorporateEvaluationPeriodsService {
  async run(id: number) {
    await axios.delete(`${services.corporate}/corporate-evaluation-periods/${id}`);
  }
}
