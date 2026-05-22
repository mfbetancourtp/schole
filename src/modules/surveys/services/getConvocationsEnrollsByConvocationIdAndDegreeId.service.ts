import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetConvocationsEnrollsByConvocationIdAndDegreeIdService {
  async run(convocationId: number, degreeId: number) {
    return axios.get(`${services.academic}/academic-planning/convocations-enrolls/convocation/${convocationId}/degree/${degreeId}`).then((response) => response.data);
  }
}
