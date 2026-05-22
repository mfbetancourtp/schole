import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteOfferingSectionService {
  async run(offeringSectionId: number): Promise<void> {
    await axios.delete(`${services.academic}/planning/offering-sections/${offeringSectionId}`);
  }
}
