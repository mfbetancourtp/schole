import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateTravelExpensesService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-administration/travel-expenses`;
}
