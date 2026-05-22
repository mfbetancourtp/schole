import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

interface ICreateOrUpdateDegreeViewService {
  name: string;
  abbreviation?: string;
  levelId: any;
  minCredits: number;
  maxCredits: number;
}

export class CreateOrUpdateDegreeViewService extends CreateOrUpdateBaseService<ICreateOrUpdateDegreeViewService> {
  url = `${services.academic}/academic-programs/degrees`;
}
