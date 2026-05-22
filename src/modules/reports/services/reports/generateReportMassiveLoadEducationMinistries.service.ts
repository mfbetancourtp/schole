import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportMassiveLoadEducationMinistriesService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/summary-averages-half-unit-end`, data)
      .then(response => response.data);
  }
}