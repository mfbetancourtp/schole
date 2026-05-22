import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteDocumentsBudgetsService {
  async run(documentId: number) {
    await axios.delete(`${services.budget}/admin/documents-budgets/${documentId}`);
  }
}
