import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateAttendanceWithAttendancesService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-implementation/sessions-with-attendances`;
}
