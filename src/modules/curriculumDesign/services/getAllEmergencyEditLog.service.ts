import axios from 'axios';
import { services } from '../../../shared/constant/services';

export class GetAllEmergencyEditLogService {
  async run(params: any) {
    return axios.get(`${services.curricularDesign}/logs/getAll`, { params }).then((response) => response.data);
  }
}
