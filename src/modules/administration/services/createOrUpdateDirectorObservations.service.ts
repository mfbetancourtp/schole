import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateDirectorObservationsService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-administration/courses/directorObservations/createOrUpdate`;
}
