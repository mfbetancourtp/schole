import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportSummaryOfOverallAveragesService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/general-averages`, data).then((response) => response.data);
  }
}
