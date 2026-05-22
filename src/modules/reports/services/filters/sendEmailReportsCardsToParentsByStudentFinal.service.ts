import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class SendEmailReportsCardsToParentsByStudentFinalService {
  async run(params: any): Promise<any> {
    params.template = 'reportCardEndOfYear';

    return axios.post(`${services.reports}/send-reports-cards-to-parents-by-student`, params).then((response) => response.data);
  }
}
