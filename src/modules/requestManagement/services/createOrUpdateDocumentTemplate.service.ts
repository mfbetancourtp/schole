import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { CreateOrUpdateDocumentTemplateDto } from '../dtos/documentTemplates.dto';

export class CreateOrUpdateDocumentTemplateService extends CreateOrUpdateBaseService<CreateOrUpdateDocumentTemplateDto> {
  url = `${services.structure}/document-templates`;
}
