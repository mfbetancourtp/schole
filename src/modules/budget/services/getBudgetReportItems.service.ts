import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetBudgetReportItemsService {
  async run() {
    return axios.get(`${services.reports}/report-items`).then((response) => response.data);
  }
}
