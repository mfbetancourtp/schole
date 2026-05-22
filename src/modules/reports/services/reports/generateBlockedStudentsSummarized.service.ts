import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateBlockedStudentsSummarizedService {
  async run(params: any): Promise<any> {
    return axios.get(`${services.reports}/students-disabled-report-card-summarized`, {params})
      .then(response => response.data);
  }
}