import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetExportExcel {
  async run(id: number) {
    return axios.get<any>(`${services.academic}/academic-planning/convocation-enrol-steps-report?convocationStepId=${id}`).then((response) => response.data);
  }
}
