import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

// export interface ICreateOrUpdateAcademicPeriodGroupsService {
//     name: string;
//     curriculumId: number;
//     calendarTypeId: number;
//     startDate: string;
//     endDate: string;
//     active: boolean;
// }

// export class CreateOrUpdateAcademicPeriodGroupsService extends CreateOrUpdateBaseService<ICreateOrUpdateAcademicPeriodGroupsService> {
export class CreateOrUpdateAcademicPeriodGroupsService extends CreateOrUpdateBaseService<any> {
    url = `${services.academic}/academic-planning/academic-period-groups`;
    isFormData = false;
}