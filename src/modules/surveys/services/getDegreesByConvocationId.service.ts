import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDegreesByConvocationIdService {
  async run(convocationId: number) {
    return axios.get(`${services.academic}/academic-planning/convocations/${convocationId}/degrees`).then((response) => response.data);
  }
}
