import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateOrUpdateMenuModuleDto } from '../dtos/menuModule.dto';

export class CreateOrUpdateModuleService extends CreateOrUpdateBaseService<CreateOrUpdateMenuModuleDto> {
  url = `${services.v2}/menu/modules`;
}
