import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportPerformanceStatisticsByLevelWithGraphService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/performance-statistics-by-level-to-graph`, data).then((response) => response.data);
  }
}
