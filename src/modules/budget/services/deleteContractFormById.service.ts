import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteContractFormByIdService {
  async run(contractFormId: number) {
    await axios.delete(`${services.budget}/admin/budget-contract-form/${contractFormId}`);
  }
}
