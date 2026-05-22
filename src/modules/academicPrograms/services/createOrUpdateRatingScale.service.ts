import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateRatingScaleService {
    title: string;
    abbreviation: string;
    description: string;
}

export class CreateOrUpdateRatingScaleService extends CreateOrUpdateBaseService<ICreateOrUpdateRatingScaleService> {
    url = `${services.academic}/academic-programs/rating-scales`;
}