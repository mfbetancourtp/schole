import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateIdentificationTypesService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateIdentificationTypesService extends CreateOrUpdateBaseService<ICreateOrUpdateIdentificationTypesService> {
    url = `${services.users}/people/identification-types`;
    isFormData = false;
}