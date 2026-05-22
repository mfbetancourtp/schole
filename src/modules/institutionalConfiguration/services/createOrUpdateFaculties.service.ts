import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateFacultiesService {
  name: string;
  code: string;
  description?: string;
  directorUserId: number;
  campusIds: number[];
}

export class CreateOrUpdateFacultiesService extends CreateOrUpdateBaseService<ICreateOrUpdateFacultiesService> {
  url = `${services.structure}/faculties`;
}
