import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class PostDigitalSignatureService {
  run(data: any) {
    return axios.post(`${services.reports}/digital-signature`, data).then((response) => response.data);
  }
}
