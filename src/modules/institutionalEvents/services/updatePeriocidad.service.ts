import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdatePeriocidadService {
  async run(periodicityID: any) {
    return axios.put(`${services.configurations}/periodicity/${periodicityID}`).then((response) => response.data);
  }
}
