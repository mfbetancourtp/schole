import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';
import { typeContractDto } from '../dtos/typeContract.dto';

export class GetTypeContractService {
  async run(params?: { contractTypeId: any }) {
    return axios
      .get<typeContractDto[]>(`${services.budget}/admin/type-contract`, {
        params,
      })
      .then((response) => response.data);
  }
}
