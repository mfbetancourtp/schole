import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCertificatesTemplatesService {
  run(id: number) {
    return axios.get(`${services.certificates}/templates/${id}`).then((response) => response.data);
  }
}
