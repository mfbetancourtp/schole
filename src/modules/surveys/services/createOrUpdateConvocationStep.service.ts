import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

export class CreateOrUpdateConvocationStepService extends CreateOrUpdateBaseService<any> {
    url = `${services.academic}/academic-planning/convocation-steps`;
}