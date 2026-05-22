import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateStudyPlanService {
    name: string;
    administrativeResolution?: string;
}

export class CreateOrUpdateStudyPlanService extends CreateOrUpdateBaseService<ICreateOrUpdateStudyPlanService> {
    url = `${services.academic}/academic-programs/curriculums`;
}