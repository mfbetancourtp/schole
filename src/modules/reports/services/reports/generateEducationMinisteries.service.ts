import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateEducationMinisteriesService {
  async run(academicPeriodGroupId: number): Promise<any> {
    return axios.get(`${services.reports}/education-ministeries/${academicPeriodGroupId}`)
      .then(response => response.data);
  }
}