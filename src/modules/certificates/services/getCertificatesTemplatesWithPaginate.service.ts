import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCertificatesTemplatesWithPaginateService {
  run(params: any) {
    return axios.get(`${services.certificates}/templates`, { params }).then((response) => response.data);
  }
}
