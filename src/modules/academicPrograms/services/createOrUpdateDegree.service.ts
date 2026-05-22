import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateDegreeService {
  name: string;
  abbreviation?: string;
  levelId: number;
  file: any;
  lastGrade: number;
}

export class CreateOrUpdateDegreeService extends CreateOrUpdateBaseService<ICreateOrUpdateDegreeService> {
  url = `${services.academic}/academic-programs/degrees`;
}
