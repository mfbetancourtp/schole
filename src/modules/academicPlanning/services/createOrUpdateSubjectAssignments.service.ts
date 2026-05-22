import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

// export interface ICreateOrUpdateSubjectAssignmentsService {
//     academicPeriodGroupId: number | null;
//     curriculumSubjectIds: any[];
//     teacherPeopleId: number;
// }

// export class CreateOrUpdateSubjectAssignmentsService extends CreateOrUpdateBaseService<ICreateOrUpdateSubjectAssignmentsService> {
export class CreateOrUpdateSubjectAssignmentsService extends CreateOrUpdateBaseService<any> {
    url = `${services.academic}/academic-planning/subject-assignments`;
    isFormData = false;
}