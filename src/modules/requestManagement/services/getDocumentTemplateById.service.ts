import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { DocumentTemplateDto } from '../dtos/documentTemplates.dto';

export class GetDocumentTemplateByIdService {
  async run(id: number) {
    return axios.get<DocumentTemplateDto>(`${services.structure}/document-templates/${id}`).then((response) => response.data);
  }
}
