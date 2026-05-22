import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateApplicationTypeDocumentService extends CreateOrUpdateBaseService<Record<string, any>> {
  url = `${services.structure}/application-types-documents`;
}
