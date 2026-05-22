import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PostLoginSSOService {
  run(data: any) {
    return axios.post(`${services.classroom}/classroom-administration/auth/moodle-kinn-sso`, data).then((response) => response.data);
  }
}
