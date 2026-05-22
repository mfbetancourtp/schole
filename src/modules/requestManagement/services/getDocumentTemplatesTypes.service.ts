import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { DocumentTemplateTypeDto } from '../dtos/documentTemplates.dto';

export class GetDocumentTemplatesTypesService {
  run() {
    return axios
      .get<DocumentTemplateTypeDto[]>(`${services.structure}/document-templates-type`, {
        params: { noPag: true },
      })
      .then((response) => response.data);
  }
}
