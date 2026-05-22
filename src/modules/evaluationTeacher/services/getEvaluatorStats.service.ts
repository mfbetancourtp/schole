import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEvaluatorStatsService {
  run(params: any) {
    return axios.get(`${services.evaluationExecution}/evaluator-stats`, { params }).then((response) => response.data);
  }
}
