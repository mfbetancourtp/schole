import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportPeriodSummaryGroupNewService {
  async run(params: any): Promise<any> {
    return axios.post(`${services.reports}/period-summary-by-academic-period-group-new/${params.academicPeriodGroupId}`, params).then((response) => response.data);
  }
}
