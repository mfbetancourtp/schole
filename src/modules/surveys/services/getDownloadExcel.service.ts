import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDownloadExcelService {
  async run(params: any) {
    return axios.get<any>(`${services.academic}/academic-planning/convocation-enrol-steps-report`, { params }).then((response) => response.data);
  }
}
