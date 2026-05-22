import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class UpdateUserSignatureservice {
  async run(roleId: number | null, file: string) {
    let pathParameter = '';

    if (roleId) {
      pathParameter = `${roleId}`;
    }

    const formData = new FormData();
    formData.append('file', file);

    return axios.put(`${services.users}/access/user-signature/${pathParameter}`, formData).then((response) => response.data);
  }
}
