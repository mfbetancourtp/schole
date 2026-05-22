import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateSignatureByRoleIdservice {
  run(data: any, roleId: number) {
    console.log(data);

    return axios.post(`${services.reports}/digital-signature/create-by-role/${roleId}`, data).then((response) => response.data);
  }
}
