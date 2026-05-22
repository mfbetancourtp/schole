import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DuplicateEvaluationTemplateService {
  async run(id: number | string) {
    const response = await axios.post(`${services.evaluationTeacher}/evaluation-templates/${id}/duplicate`);
    return response.data;
  }
}
