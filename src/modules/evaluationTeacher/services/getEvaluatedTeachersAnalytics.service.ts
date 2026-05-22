import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetEvaluatedTeachersAnalyticsService {
  run(params: any) {
    const { evaluationId, order, ...restParams } = params;
    return axios
      .get(`${services.evaluationTeacher}/analytics/${evaluationId}/evaluated`, {
        params: {
          ...restParams,
          ...(order ? { order: order.toUpperCase() } : {}),
        },
      })
      .then((r) => r.data);
  }
}
