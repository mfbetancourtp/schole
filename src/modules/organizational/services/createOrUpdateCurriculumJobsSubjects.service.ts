import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateCurriculumJobsSubjectsService {
  organizationalJobId: number;
  curriculumSubjectId: number;
  isOptional: number;
}

export class CreateOrUpdateCurriculumJobsSubjectsService extends CreateOrUpdateBaseService<ICreateOrUpdateCurriculumJobsSubjectsService> {
  url = `${services.organizational}/admin/curriculum-jobs-subjects`;
}
