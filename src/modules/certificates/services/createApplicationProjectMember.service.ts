import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateApplicationProjectMemberService {
  run(data: { applicationProjectsId: number; userId: number }) {
    return axios.post(`${services.structure}/application-projects-members`, data).then((r) => r.data);
  }
}
