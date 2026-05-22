import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateCurriculumDegreesService {
    degreeId: number;
    curriculumId: number;
    maxSubjectFailed: number;
}

export class CreateOrUpdateCurriculumDegreesService extends CreateOrUpdateBaseService<ICreateOrUpdateCurriculumDegreesService> {
    url = `${services.academic}/academic-programs/curriculums-degrees`;
}