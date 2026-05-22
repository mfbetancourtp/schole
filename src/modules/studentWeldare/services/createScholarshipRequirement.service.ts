import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateScholarshipRequirementService {
  run(data: { requirementType: string; operator: string; value: number | string; isRequired: boolean }) {
    return axios.post(`${services.structure}/scholarship-requirements`, data).then((r) => r.data);
  }
}
