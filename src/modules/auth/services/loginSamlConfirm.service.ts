import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class SamlConfirmService {
  run(data: any, token: string): Promise<any> {
    return axios
      .post(`${services.saml}/confirm`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.data);
  }
}
