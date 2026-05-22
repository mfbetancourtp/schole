import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMonitoringStatusesService {
  async run(monitoringStatusesId: number): Promise<void> {
    await axios.delete(`${services.classroom}/disciplinary-control/monitoring-statuses/${monitoringStatusesId}`);
  }
}
