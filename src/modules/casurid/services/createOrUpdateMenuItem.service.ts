import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateOrUpdateMenuItemDto } from '../dtos/menuItem.dto';

export class CreateOrUpdateMenuItemService extends CreateOrUpdateBaseService<CreateOrUpdateMenuItemDto> {
  url = `${services.v2}/menu/items`;
}
