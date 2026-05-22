import { services } from '../../../shared/constant/services';
import { UpdateBaseNoneIdService } from '../../../shared/services/UpdateBaseNoneId.service';

export class UpdateTypeContractReportsUpdateService extends UpdateBaseNoneIdService<any> {
  url = `${services.budget}/admin/type-contract-reports-update`;
}
