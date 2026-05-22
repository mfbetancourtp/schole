import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { ResourceInventoryStatus } from '../dtos/resourceInventory.dto';

interface ICreateOrUpdateResourceInventory {
  code: string;
  resourceTypeId: number;
  name: string;
  make: string;
  model: string;
  serial: string;
  quantity: number;
  initialStateId: ResourceInventoryStatus;
  purchaseDate: string;
  purchaseValue: number;
}

export class CreateOrUpdateResourceInventoryService extends CreateOrUpdateBaseService<ICreateOrUpdateResourceInventory> {
  url = `${services.academic}/resources`;
  isFormData = false;
}
