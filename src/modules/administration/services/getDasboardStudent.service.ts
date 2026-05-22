import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
// interface paramsAdminDashboard {
//   academicPeriodId: number;
//   degreeId: number;
//   groupId: number;
//   levelId: number;
// }
export class GetDasboardStudent {
  run(params: any = {}) {
    return axios
      .get(`${services.dashboard}/studentDashboard`, {
        params,
      })
      .then((response) => response.data);
  }
}
