import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateProfessionalProfilePhotoService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/professional-profiles/photo`;
  isFormData = true;
}
