import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteStatusAdministrationService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.budget}/admin/status-budget-validates/${id}`);
  }
}
