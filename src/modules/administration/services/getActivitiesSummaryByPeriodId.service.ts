import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

export class GetActivitiesSummaryByPeriodIdService {
  async run(courseId: any, periodId: any) {
    const params = periodId ? { periodId } : {};
    const url = `${services.classroom}/classroom-assessment/courses/${courseId}/activities-summary`;

    const response = await axios.get(url, { params });

    return response.data;
  }
}
