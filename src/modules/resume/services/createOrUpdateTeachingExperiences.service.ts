import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateTeachingExperiencesService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/teaching-experiences`;
}
