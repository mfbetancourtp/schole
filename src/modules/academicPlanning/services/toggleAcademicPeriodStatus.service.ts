import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class ToggleAcademicPeriodStatusService {
  async run(id: number, active: number): Promise<any> {
    return axios
      .patch(`${services.academic}/planning/academic-periods/${id}/status`, {
        active,
      })
      .then((response) => response.data);
  }
}
