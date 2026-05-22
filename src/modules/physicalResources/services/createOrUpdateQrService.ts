import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateQrService {
  async run(data: any) {
    return axios
      .post(`${services.users}/attendance-qr`, data)
      .then(response => response.data);
  }
}