import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdateUserSignatureservice {
  async run(userId: number | null, file: string) {
    let pathParameter = '';

    if (userId) {
      pathParameter = `${userId}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    return axios
      .put(`${services.users}/access/user-signature/${pathParameter}`, formData)
      .then((response) => response.data);
  }
}
