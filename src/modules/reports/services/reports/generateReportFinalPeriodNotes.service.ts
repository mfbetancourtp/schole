import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateReportFinalPeriodNotesService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/final-period-notes-report`, data).then((response) => response.data);
  }
}
