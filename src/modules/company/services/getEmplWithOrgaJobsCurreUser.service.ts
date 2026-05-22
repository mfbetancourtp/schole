import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEmplWithOrgaJobsCurreUserService {
  async run() {
    return axios.get(`${services.organizational}/employee-with-organizational-jobs-current-user`).then((response) => response.data);
  }
}
