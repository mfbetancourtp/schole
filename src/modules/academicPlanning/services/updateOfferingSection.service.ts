import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdateOfferingSectionService {
  async run(offeringSectionId: number, data: any): Promise<any> {
    const response = await axios.put(`${services.academic}/planning/offering-sections/${offeringSectionId}`, data);
    return response.data;
  }
}
