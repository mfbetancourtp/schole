import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateCompetencyLevelService {
    name: string;
}

export class CreateOrUpdateCompetencyLevelService extends CreateOrUpdateBaseService<ICreateOrUpdateCompetencyLevelService> {
    url = `${services.classroom}/classroom-administration/competencyLevels`;
    isFormData = false;
}