

import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateBankAccountService extends CreateOrUpdateBaseService<any> {
url =  `${services.budget}/admin/bank-accounts`;

}

