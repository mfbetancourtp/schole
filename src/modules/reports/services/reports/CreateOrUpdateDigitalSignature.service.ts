import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class CreateOrUpdateDigitalSignatureservice {
  run(data: any) {
    return axios.post(`${services.reports}/digital-signature/update-position-reports`, data).then((response) => response.data);
  }
}
