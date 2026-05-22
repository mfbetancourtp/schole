import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GeneratePeaceSafetyService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/cards-by-level-peace-safety`, data).then((response) => response.data);
  }
}
