import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface ICreateOrUpdateMonitoringStatusesService {
  name: string;
  code?: string;
  color: string;
}

export class CreateOrUpdateMonitoringStatusesService extends CreateOrUpdateBaseService<ICreateOrUpdateMonitoringStatusesService> {
  url = `${services.classroom}/disciplinary-control/monitoring-statuses`;
  isFormData = false;
}
