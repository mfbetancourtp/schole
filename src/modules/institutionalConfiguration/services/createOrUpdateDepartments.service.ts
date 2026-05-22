import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateDepartmentsService {
  name: string;
  code: string;
  description?: string;
  directorUserId: number;
  facultyId: number;
}

export class CreateOrUpdateDepartmentsService extends CreateOrUpdateBaseService<ICreateOrUpdateDepartmentsService> {
  url = `${services.structure}/departments`;
}
