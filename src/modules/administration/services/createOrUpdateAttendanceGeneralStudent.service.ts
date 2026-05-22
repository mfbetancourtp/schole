import {services} from '../../../shared/constant/services';
import {UpdateBaseNoneIdService} from '../../../shared/services/UpdateBaseNoneId.service';

export class CreateOrUpdateAttendanceGeneralStudentService extends UpdateBaseNoneIdService<any> {
    url = `${services.classroom}/classroom-implementation/attendances-by-ids`;
    isFormData = true;
}