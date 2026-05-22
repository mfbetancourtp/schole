

import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateSuppliersService extends CreateOrUpdateBaseService<any> {
url =  `${services.budget}/admin/suppliers`;isFormData = true;

}

