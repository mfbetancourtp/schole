import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportExcelentAcedemicService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/academic-excellence`, data).then((response) => response.data);
  }
}
