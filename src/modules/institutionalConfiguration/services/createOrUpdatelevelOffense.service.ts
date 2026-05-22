import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdatelevelOffenseService {
  name: string;
  abbreviation?: string;
  levelOffenseSystemId?: any;
}

export class CreateOrUpdatelevelOffenseService extends CreateOrUpdateBaseService<ICreateOrUpdatelevelOffenseService> {
  url = `${services.classroom}/disciplinary-control/level-offenses`;
}
