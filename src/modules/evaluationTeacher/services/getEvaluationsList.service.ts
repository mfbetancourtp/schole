import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEvaluationsListService {
  run(params: any) {
    return axios.get(`${services.evaluationExecution}/list`, { params }).then((response) => response.data);
  }
}
