import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GenerateOfferingSectionsService {
  async run(data: any): Promise<any> {
    const response = await axios.post(`${services.academic}/planning/offering-sections/generate`, data);
    return response.data;
  }
}
