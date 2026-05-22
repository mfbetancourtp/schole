import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteDocumentTemplateService {
  async run(id: number) {
    await axios.delete(`${services.structure}/document-templates/${id}`);
  }
}
