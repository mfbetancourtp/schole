import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateAttendanceService extends CreateOrUpdateBaseService<any> {
    url = `${services.classroom}/classroom-implementation/attendances`;
    isFormData = true;
}