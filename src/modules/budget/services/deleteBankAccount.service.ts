import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteBankAccountService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.budget}/admin/bank-accounts/${id}`);
  }
}
