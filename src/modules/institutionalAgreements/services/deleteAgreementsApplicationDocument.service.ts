import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementsApplicationDocumentService {
  run(id: number | string): Promise<void> {
    return axios.delete(`${services.structure}/agreements-applications-documents/${id}`).then(() => undefined);
  }
}
