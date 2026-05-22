import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetConvocationWithStepsSummaryService {
  async run(params: any) {
    return axios.get<any>(`${services.academic}/academic-planning/convocation-with-steps-summary`, { params }).then((response) => response.data);
  }
}
