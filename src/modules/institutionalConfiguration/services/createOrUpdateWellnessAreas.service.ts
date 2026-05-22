import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateWellnessAreasService {
    name: string;
}

export class CreateOrUpdateWellnessAreasService extends CreateOrUpdateBaseService<ICreateOrUpdateWellnessAreasService> {
    url = `${services.academic}/institutional-configuration/wellness-areas`;
    isFormData = false;
}