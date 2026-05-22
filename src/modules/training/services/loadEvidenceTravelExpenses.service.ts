import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class LoadEvidenceTravelExpensesService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-administration/travel-expenses-url-consolidate-evidence`;
  isFormData = true;
}
