import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateSpace {
  code: string;
  name: string;
  spaceTypeId: number;
  floorId: number | null;
  responsibleUderId: number | null;
  capacity: number | null;
  area: number | null;
  isActive: boolean;
}

export class CreateOrUpdateSpaceService extends CreateOrUpdateBaseService<ICreateOrUpdateSpace> {
  url = `${services.academic}/spaces`;
  isFormData = false;
}
