import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetConvocationEnrollDetailsService {
  async run(convocationEnrolId: number) {
    return axios.get(`${services.academic}/convocations/enrolls/${convocationEnrolId}/details`).then((response) => response.data);
  }
}
