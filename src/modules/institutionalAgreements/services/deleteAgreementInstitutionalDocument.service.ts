import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementInstitutionalDocumentService {
  run(id: number): Promise<void> {
    return axios.delete(`${services.structure}/agreements-institutional-documents/${id}`).then(() => undefined);
  }
}
