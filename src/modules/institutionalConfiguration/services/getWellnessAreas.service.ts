import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetWellnessAreasService {
  run() {
    return axios.get(`${services.academic}/institutional-configuration/wellness-areas`).then((response) => response.data);
  }
}
