import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportPerformanceStatisticsByLevelService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/performance-statistics-by-level`, data)
      .then(response => response.data);
  }
}