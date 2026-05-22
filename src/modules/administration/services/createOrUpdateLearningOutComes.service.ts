import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateLearningOutComesService {
    code: string | null;
    description: string | null;
    competencyId: number;
    
}

export class CreateOrUpdateLearningOutComesService extends CreateOrUpdateBaseService<ICreateOrUpdateLearningOutComesService> {
    url = `${services.classroom}/classroom-administration/learningOutcomes`;
    isFormData = false;
}