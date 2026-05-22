import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportEvaluationComissionService {
  async run(params: any): Promise<any> {
    return axios.get(`${services.reports}/report-store/download-report-evaluation-comission`, { params }).then((response) => response.data);
  }
}
