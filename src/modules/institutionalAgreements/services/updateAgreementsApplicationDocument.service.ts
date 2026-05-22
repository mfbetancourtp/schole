import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { UpdateAgreementsApplicationDocumentDto } from '../dtos/agreementsApplicationDocument.dto';

export class UpdateAgreementsApplicationDocumentService {
  async update(documentId: number, payload: UpdateAgreementsApplicationDocumentDto) {
    return axios.put(`${services.structure}/agreements-applications-documents/${documentId}`, payload).then((r) => r.data);
  }
}
