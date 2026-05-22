import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetCertificateVarsService {
  run() {
    return axios.get(`${services.certificates}/vars`).then((response) => response.data);
  }
}
