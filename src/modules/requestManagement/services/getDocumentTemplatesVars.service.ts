import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { DocumentTemplateVarDto } from '../dtos/documentTemplates.dto';

export class GetDocumentTemplatesVarsService {
  run(params?: { documentTemplateId?: number }) {
    return axios
      .get<DocumentTemplateVarDto[]>(`${services.structure}/document-templates-vars`, {
        params: { noPag: true, ...params },
      })
      .then((response) => response.data);
  }
}
