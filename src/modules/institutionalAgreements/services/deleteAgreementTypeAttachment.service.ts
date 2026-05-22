import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementTypeAttachmentService {
  run(attachmentId: string): Promise<void> {
    return axios.delete(`${services.structure}/agreements-types-attachments/${attachmentId}`).then(() => undefined);
  }
}
