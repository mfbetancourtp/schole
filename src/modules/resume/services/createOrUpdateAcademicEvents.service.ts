import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateAcademicEventsService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/academicEvents`;
}
