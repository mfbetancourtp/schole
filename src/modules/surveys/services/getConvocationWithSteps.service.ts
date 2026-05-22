import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetConvocationWithStepsService {
  async run(convocationId: any, params: any) {
    return axios.get(`${services.academic}/academic-planning/convocation-with-steps/${convocationId}`, { params }).then((response) => response.data);
  }
}
