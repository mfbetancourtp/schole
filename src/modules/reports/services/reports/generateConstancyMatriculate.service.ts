import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateConstancyMatriculateService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/cards-by-level-certificate`, data).then((response) => response.data);
  }
}
