import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  isCdp: boolean;
  statusId: any;
}
export class UpdateReportStatesActionsBudgetsService {
  async run(id: any, data: IParams): Promise<void> {
    await axios.put(`${services.budget}/admin/report-store-actions-budgets/${id}`, data);
  }
}
