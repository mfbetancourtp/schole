import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTypeContractReportsService {
  async run(typeContractReportId: number) {
    return axios.delete<any>(`${services.budget}/admin/type-contract-reports/${typeContractReportId}`).then((response) => response.data);
  }
}
