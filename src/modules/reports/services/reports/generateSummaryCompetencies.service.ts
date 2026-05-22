import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateSummaryCompetenciesService {
  async run(params: any): Promise<any> {
    return axios.get(`${services.reports}/summary-competencies`, { params }).then((response) => response.data);
  }
}
