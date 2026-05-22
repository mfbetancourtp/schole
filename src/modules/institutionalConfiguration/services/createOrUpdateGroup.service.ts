import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateGroupService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateGroupService extends CreateOrUpdateBaseService<ICreateOrUpdateGroupService> {
    url = `${services.academic}/institutional-configuration/groups`;
    isFormData = false;
}