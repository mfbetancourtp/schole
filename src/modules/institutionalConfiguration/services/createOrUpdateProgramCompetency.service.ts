import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateProgramCompetency {
  name: string;
  code: string;
  competencyType: string;
  programId: number;
}

export class CreateOrUpdateProgramCompetencyService extends CreateOrUpdateBaseService<ICreateOrUpdateProgramCompetency> {
  url = `${services.academic}/program-competencies`;
  isFormData = false;
}
