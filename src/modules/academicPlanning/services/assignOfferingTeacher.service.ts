import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class AssignOfferingTeacherService {
  async run(data: any): Promise<any> {
    const response = await axios.post(`${services.academic}/planning/offering-teachers/assign`, data);
    return response.data;
  }
}
