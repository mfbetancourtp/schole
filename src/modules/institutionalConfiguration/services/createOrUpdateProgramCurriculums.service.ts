import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateProgramCurriculumsService {
  programId: number;
  name: string;
  code: string;
  description: string;
  qualifiedRegistration: string;
  internalRegistration: string;
  version: string;
  startDate: string;
  endDate: string;
  state: string;
}

export class CreateOrUpdateProgramCurriculumsService extends CreateOrUpdateBaseService<ICreateOrUpdateProgramCurriculumsService> {
  url = `${services.structure}/program-curriculums`;
  isFormData = false;
}
