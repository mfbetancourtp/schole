import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteResponsiblesInstitutionalActivitiesByIdService {
  async run(responsibleId: number): Promise<void> {
    await axios.delete(`${services.configurations}/responsibles-institutional-activities/${responsibleId}`);
  }
}
