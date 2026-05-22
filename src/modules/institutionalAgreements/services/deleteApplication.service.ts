import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationService {
  run(applicationId: string | number): Promise<void> {
    return axios.delete(`${services.structure}/applications/${applicationId}`).then(() => undefined);
  }
}
