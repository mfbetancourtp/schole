import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateActivityService extends CreateOrUpdateBaseService<any> {
    url = `${services.classroom}/classroom-assessment/activities`;
}