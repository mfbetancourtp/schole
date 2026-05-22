import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteAllParticipantsByIdService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.configurations}/views-institutional-activities/${id}`);
  }
}
