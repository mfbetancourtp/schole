import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportPerformanceStatisticsByGroupWithGraphService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/performance-statistics-by-academic-period-group-to-graph/${data.academicPeriodGroupId}`, data).then((response) => response.data);
  }
}
