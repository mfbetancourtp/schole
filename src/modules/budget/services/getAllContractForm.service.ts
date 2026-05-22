import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { contractFormDto } from '../dtos/contractForm.dto';

export class GetAllContractFormService {
  async run() {
    return axios.get<contractFormDto[]>(`${services.budget}/admin/budget-contract-form`).then((response) => response.data);
  }
}
