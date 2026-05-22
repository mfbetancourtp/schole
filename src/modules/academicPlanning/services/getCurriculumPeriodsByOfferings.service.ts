import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCurriculumPeriodsByOfferingsService {
  async run(params: any): Promise<any> {
    const response = await axios.get(`${services.structure}/curriculum-periods/by-offerings`, { params });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  }
}
