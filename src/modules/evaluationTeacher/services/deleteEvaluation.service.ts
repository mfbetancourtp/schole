import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEvaluationService {
  run(id: number) {
    return axios.delete(`${services.evaluationTeacher}/evaluations/${id}`).then((response) => response.data);
  }
}
