import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteDocumentFormulaByIdService {
  async run(formulaId: number) {
    await axios.delete(`${services.academic}/academic-administration/document-formulas/${formulaId}`);
  }
}