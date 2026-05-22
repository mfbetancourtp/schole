import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class UpdateSignatureSuppliersService extends CreateOrUpdateBaseService<any> {
  url = `${services.budget}/admin/suppliers-signature`;
  isFormData = true;
}
