import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateMatriculateService {
  people: {};
  matriculate: {};
  student: {};
}

export class CreateOrUpdateMatriculateService extends CreateOrUpdateBaseService<ICreateOrUpdateMatriculateService> {
  url = `${services.academicAdministration}/matriculates`;
  isFormData = false;
}
