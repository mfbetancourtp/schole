import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetQrsWithPaginationService {
  async run(params: any = {}) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return axios
      .get(`${services.attendanceqr}/spaces`, { params })
      .then(response => response.data);
      
  }
}