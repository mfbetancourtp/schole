import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

import { ParamsCreateOrUpdateDirectorObservationDto } from '../dtos/observerByUserId.dto';

export class CreateOrUpdateDirectorObservationService extends CreateOrUpdateBaseService<ParamsCreateOrUpdateDirectorObservationDto> {
  url = `${services.classroom}/classroom-administration/courses/directorObservations/createOrUpdate`;
}
