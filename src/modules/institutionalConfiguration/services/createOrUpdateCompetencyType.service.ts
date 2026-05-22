import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateCompetencyTypeService {
    name: string;
}

export class CreateOrUpdateCompetencyTypeService extends CreateOrUpdateBaseService<ICreateOrUpdateCompetencyTypeService> {
    url = `${services.classroom}/classroom-administration/competency-types`;
}