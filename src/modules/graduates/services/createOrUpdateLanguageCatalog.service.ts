import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface LanguageCatalogRequest {
  name: string;
  key: string;
  isActive: number;
}

export class CreateOrUpdateLanguageCatalogService extends CreateOrUpdateBaseService<LanguageCatalogRequest> {
  url = `${services.structure}/languages`;
  isFormData = false;
}
