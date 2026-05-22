import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface UpdateCurriculumOfferingConfigDto {
  minCapacity: number;
  maxCapacity: number;
  periodValue: number;
  programCurriculumId: number;
}

export class UpdateCurriculumOfferingConfigService {
  async run(id: number, payload: UpdateCurriculumOfferingConfigDto): Promise<any> {
    return axios.put(`${services.academic}/planning/curriculum-offerings/${id}/config`, payload).then((response) => response.data);
  }
}
