import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementService {
  run(id: string | number): Promise<void> {
    return axios.delete(`${services.structure}/agreements/${id}`).then(() => undefined);
  }
}
