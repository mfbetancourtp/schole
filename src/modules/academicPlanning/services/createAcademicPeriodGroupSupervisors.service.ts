import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateAcademicPeriodGroupSupervisorsService {
    supervisorUserId: number | null;
    academicPeriodGroupIds: number[] | null;
}

export class CreateAcademicPeriodGroupSupervisorsService extends CreateOrUpdateBaseService<ICreateAcademicPeriodGroupSupervisorsService> {
    url = `${services.academic}/academic-planning/academic-period-group-supervisors`;
    isFormData = false;
}