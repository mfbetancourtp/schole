import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { DocumentTemplateDto } from '../dtos/documentTemplates.dto';

export class GetDocumentTemplatesWithPaginationService {
  run(params?: ParamsPaginationDto) {
    return axios
      .get<ResponsePaginationDto<DocumentTemplateDto>>(`${services.structure}/document-templates`, {
        params,
      })
      .then((response) => response.data);
  }
}
