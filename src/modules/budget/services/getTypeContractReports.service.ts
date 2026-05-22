import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';
import { typeContractReportsDto } from '../dtos/typeContractReports.dto';

export class GetTypeContractReportsService {
  async run(params?: { typeContractId: any }) {
    return axios
      .get<typeContractReportsDto[]>(`${services.budget}/admin/type-contract-reports`, {
        params,
      })
      .then((response) => response.data);
  }
}
