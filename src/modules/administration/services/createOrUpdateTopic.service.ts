import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateTopicService {
    name: string | null;
    description: string | null;
    competencyId: number;
    
}

export class CreateOrUpdateTopicService extends CreateOrUpdateBaseService<ICreateOrUpdateTopicService> {
    url = `${services.classroom}/classroom-administration/topics`;
    isFormData = false;
}