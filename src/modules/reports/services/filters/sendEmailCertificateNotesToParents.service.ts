import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class SendEmailCertificateNotesToParentsService {
  async run(params: any): Promise<any> {
    return axios.post(`${services.reports}/send-reports-cards-to-parents-certification-final`, params).then((response) => response.data);
  }
}
