import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class ReviewScholarshipDocumentService {
  run(documentId: number, status: 'Aprobado' | 'Rechazado', comment: string, userId?: number) {
    return axios
      .put(`${services.structure}/scholarship-applications/documents/${documentId}/review`, { status, comment }, { headers: userId ? { userid: String(userId) } : undefined })
      .then((r) => r.data);
  }
}
