import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class RejectScholarshipApplicationService {
  run(id: number, comment: string, userId?: string) {
    return axios.patch(`${services.structure}/scholarship-applications/${id}/reject`, { comment }, { headers: userId ? { userid: userId } : undefined }).then((r) => r.data);
  }
}
