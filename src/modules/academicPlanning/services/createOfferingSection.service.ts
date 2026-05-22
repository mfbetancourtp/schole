import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateOfferingSectionService {
  async run(data: any): Promise<any> {
    const response = await axios.post(`${services.academic}/planning/offering-sections`, data);
    return response.data;
  }
}
