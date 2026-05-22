import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateWorkExperiencesService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/workExperiences`;
}
