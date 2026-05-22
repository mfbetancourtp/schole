import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GenerateConstancyMatriculatePerStudentService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/card-by-user-student-certificate/${data.userId}`, data).then((response) => response.data);
  }
}
