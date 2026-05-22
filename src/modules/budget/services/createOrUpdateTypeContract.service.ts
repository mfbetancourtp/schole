import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateTypeContractService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/type-contract`;
}
