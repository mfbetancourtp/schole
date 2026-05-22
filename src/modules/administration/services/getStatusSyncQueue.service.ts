import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetStatusSyncQueueService {
  async run(reportId: string): Promise<any> {
    return axios.get(`${services.classroom}/classroom-administration/synchronization-courseId-by-moddle/${reportId}`).then((response) => response.data);
  }
}
