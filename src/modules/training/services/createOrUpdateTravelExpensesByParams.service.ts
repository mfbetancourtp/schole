import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { TravelExpensesTrackingDto } from '../dtos/travelExpensesTracking.dto';

export class UpdateTravelExpensesService extends CreateOrUpdateBaseService<TravelExpensesTrackingDto> {
  url = `${services.classroom}/classroom-administration/travel-expenses-final-comapany-contribution`;
}
