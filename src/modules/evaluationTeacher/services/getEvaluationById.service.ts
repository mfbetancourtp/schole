import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEvaluationByIdService {
  run(id: number | string) {
    const url = `${services.evaluationTeacher}/evaluations/${id}`;
    return axios.get(url).then((r) => r.data);
  }
}
