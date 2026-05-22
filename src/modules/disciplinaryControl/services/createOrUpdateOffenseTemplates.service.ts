import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateOffenseTemplatesService {
  code: string;
  name?: string;
  isPositive: number;
}

export class CreateOrUpdateOffenseTemplatesService extends CreateOrUpdateBaseService<ICreateOrUpdateOffenseTemplatesService> {
  url = `${services.classroom}/disciplinary-control/offense-templates/offense-templates`;
}
