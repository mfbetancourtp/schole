import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateRecognitionsService extends CreateOrUpdateBaseService<any> {
  url = `${services.structure}/recognitions`;
}
