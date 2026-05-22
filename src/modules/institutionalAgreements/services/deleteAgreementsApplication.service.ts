import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementsApplicationService {
  run(id: number | string): Promise<void> {
    return axios.delete(`${services.structure}/agreements-applications/${id}`).then(() => undefined);
  }
}
