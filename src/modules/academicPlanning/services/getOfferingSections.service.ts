import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetOfferingSectionsService {
  async run(params: any): Promise<any> {
    const response = await axios.get(`${services.academic}/planning/offering-sections`, { params });
    return response.data;
  }
}
