import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateGenderService {
    name: string;
}

export class CreateOrUpdateGenderService extends CreateOrUpdateBaseService<ICreateOrUpdateGenderService> {
    url = `${services.users}/people/genders`;
    isFormData = false;
}