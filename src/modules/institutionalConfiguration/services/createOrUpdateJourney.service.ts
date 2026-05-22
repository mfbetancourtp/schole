import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface ICreateOrUpdateJourneyService {
    name: string;
    abbreviation?: string;
}

export class CreateOrUpdateJourneyService extends CreateOrUpdateBaseService<ICreateOrUpdateJourneyService> {
    url = `${services.academic}/institutional-configuration/journeys`;
    isFormData = false;
}