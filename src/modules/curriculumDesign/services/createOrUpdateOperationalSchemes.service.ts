import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

interface ICreateOperationalSchemes {
  id: number | null;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  isActive?: number | null;
  status?: string | null;
  classWeeks?: number | null;
  evaluationWeeks?: number | null;
  semesterHours?: number | null;
  credits?: number | null;
  creditsNumber?: number | null;
  maximumCredits?: number | null;
  semesterNumber?: number | null;
  weeks?: number | null;
  seminar?: number | null;
  practicalHours?: number | null;
  periodTypeId?: number | null;
  theoryOperation?: number | null;
  workshopOperation?: number | null;
  virtualOperation?: number | null;
  stepOne?: string | null;
  stepTwo?: string | null;
  stepThree?: string | null;
  showTypes?: number | null;
  isCompleted?: number | null;
  programTypeId?: number | null;
}

export class CreateOrUpdateOperationalSchemesService extends CreateOrUpdateBaseService<ICreateOperationalSchemes | any> {
  url = `${services.structure}/operational-schemes`;
  isFormData = false;
}
