import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

// export interface ICreateOrUpdateMatriculateSubjectsByCurriculumService {
//     academicPeriodGroupId: number | null;
//     curriculumSubjectIds: any[];
//     teacherPeopleId: number;
// }

// export class CreateOrUpdateMatriculateSubjectsByCurriculumService extends CreateOrUpdateBaseService<ICreateOrUpdateMatriculateSubjectsByCurriculumService> {
export class CreateOrUpdateMatriculateSubjectsByCurriculumService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/academic-administration/matriculate-subjects/by-curriculum-subjects`;
  isFormData = false;
}
