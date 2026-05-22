import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { MonitoringReportDto } from '../dtos/followUpToTopics.dto';

export class GetMonitoringReportService {
  run(courseId: number, params: any) {
    return axios.get<MonitoringReportDto>(`${services.classroom}/classroom-implementation/sessions/monitoring-report/${courseId}`, { params }).then((response) => response.data);
  }
}
