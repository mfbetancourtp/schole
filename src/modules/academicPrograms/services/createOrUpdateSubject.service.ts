import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateSubjectService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/subjects`;
}
