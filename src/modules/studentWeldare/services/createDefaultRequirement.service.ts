import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateDefaultRequirementService {
  run(data: { typeScholarshipId: number; scholarshipRequirementId: number }) {
    return axios.post(`${services.structure}/default-requirements`, data).then((r) => r.data);
  }
}
