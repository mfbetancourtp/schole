import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetGroupsByConvocationIdAndDegreeIdService {
  async run(convocationId: number, degreeId: number) {
    return axios.get(`${services.academic}/academic-planning/convocations/${convocationId}/groups?degreeId=${degreeId}`).then((response) => response.data);
  }
}
