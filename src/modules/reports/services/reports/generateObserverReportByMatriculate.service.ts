import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateObserverReportByMatriculateService {
  async run(data: any) {
    return axios.post(`${services.reports}/observer-by-matriculate/${data.userId}?itemCode=${data.itemCode}`).then((response) => response.data);
  }
}
