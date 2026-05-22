import { PostBaseService } from '../../../shared/services/PostCreateOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOperationalSchemes {
  id: number | null;
  code: string | null;
  description: string | null;
  classWeeks: number | null;
  evaluationWeeks: number | null;
  semesterHours: number | null;
  credits: number | null;
  active: boolean | null;
  levelTypeId: number | null;
}

export class CreateOrUpdateOperationalSchemesService extends PostBaseService<ICreateOperationalSchemes | any> {
  url = `${services.curricularDesign}/operationalSchemes/createOrUpdate`;
  isFormData = false;
}
