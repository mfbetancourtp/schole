import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateConsolidateSemiannualPeriodsNotes {
  async run(params: any): Promise<any> {
    return axios.get(`${services.reports}/report-store/download-report-consolidated-semiannual`, { params }).then((response) => response.data);
  }
}
