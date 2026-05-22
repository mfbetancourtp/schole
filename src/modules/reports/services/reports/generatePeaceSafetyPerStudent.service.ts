import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GeneratePeaceSafetyPerStudentService {
  async run(data: any): Promise<any> {
    return axios.post(`${services.reports}/card-by-user-student-peace-safety/${data.userId}`, data).then((response) => response.data);
  }
}
