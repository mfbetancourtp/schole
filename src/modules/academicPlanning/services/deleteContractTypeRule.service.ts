import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteContractTypeRuleService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.graduates}/contract-types/${id}`);
  }
}
