import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

import { ParamsFormFutureAbsencesDto } from '../dtos/futureAbsences.dto';

export class CreateOrUpdateFutureAbsencesService extends CreateOrUpdateBaseService<ParamsFormFutureAbsencesDto> {
  url = `${services.classroom}/classroom-implementation/future-absences`;
}
