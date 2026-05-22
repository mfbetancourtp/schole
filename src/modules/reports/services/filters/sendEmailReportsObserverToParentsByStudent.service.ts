import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class SendEmailReportsObserverToParentsByStudentService {
  async run(params: any): Promise<any> {
    return axios.post(`${services.reports}/send-observer-report-to-parents-by-student`, params).then((response) => response.data);
  }
}
