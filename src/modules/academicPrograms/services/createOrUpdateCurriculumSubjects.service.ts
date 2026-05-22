import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateCurriculumSubjectsService {
    subjectId: number;
    percentArea: number;
    curriculumDegreeId: number;
}

export class CreateOrUpdateCurriculumSubjectsService extends CreateOrUpdateBaseService<ICreateOrUpdateCurriculumSubjectsService> {
    url = `${services.academic}/academic-programs/curriculum-subjects`;
}