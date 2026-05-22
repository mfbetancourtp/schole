import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteInstitutionalAgreementService {
  run(id: number | string): Promise<void> {
    return axios.delete(`${services.structure}/agreements-institutional/${id}`).then(() => undefined);
  }
}
