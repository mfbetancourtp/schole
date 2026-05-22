import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateCompetenciesService {
    code: string | null;
    description: string | null;
    competencyTypeId: number | null;
    competencyLevelId: number | null;
    curriculumSubjectId: number | null;
}

export class CreateOrUpdateCompetenciesService extends CreateOrUpdateBaseService<ICreateOrUpdateCompetenciesService> {
    url = `${services.classroom}/classroom-administration/competencies`;
    isFormData = false;
}