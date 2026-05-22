import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DeleteDigitalSignatureByRoleIdservice {
  async run(data: any) {
    return axios.delete(`${services.reports}/digital-signature/delete-by-role/${data.roleId}?itemId=${data.itemId}&academicPeriodId=${data.academicPeriodId}`).then((response) => response.data);
  }
}
