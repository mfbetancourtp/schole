import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateMatriculateParentsService {
    people: {};
    matriculateParent: {};
}

export class CreateOrUpdateMatriculateParentsService extends CreateOrUpdateBaseService<ICreateOrUpdateMatriculateParentsService> {
    url = `${services.academic}/academic-administration/matriculate-parents`;
    isFormData = false;
}