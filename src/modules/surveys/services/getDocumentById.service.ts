import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

import { DocumentDto } from '../dtos/document.dto';

export class GetDocumentByIdService {
  async run(documentId: number) {
    return axios.get<DocumentDto>(`${services.academic}/academic-administration/documents/${documentId}`)
      .then(response => response.data);
  }
}