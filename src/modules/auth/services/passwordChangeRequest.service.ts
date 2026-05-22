import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

export class PasswordChangeRequestService {
  async run(email: string, payload: any = {}) {
    const url = `${services.users}/access/password-change-request/${email}`;
    const response = await axios.post(url, payload);

    return response.data;
  }
}
