import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteInsurance {
  async run(InsuranceId: number): Promise<void> {
    await axios.delete(`${services.users}/people/deleteInsurance/${InsuranceId}`);
  }
}
