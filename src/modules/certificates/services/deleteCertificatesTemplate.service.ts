import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCertificatesTemplateService {
  async run(id: number) {
    return axios.delete(`${services.certificates}/templates/${id}`).then((response) => response.data);
  }
}
