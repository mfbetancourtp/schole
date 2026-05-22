import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdatePlayTimesService {
  name: string;
  abbreviation?: string;
  timeSince: string;
  timeUntil: string;
}

export class CreateOrUpdatePlayTimesService extends CreateOrUpdateBaseService<ICreateOrUpdatePlayTimesService> {
  url = `${services.academic}/institutional-configuration/play-times`;
  isFormData = false;
}
