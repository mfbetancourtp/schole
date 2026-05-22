import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLevelOffensesService {
  run() {
    return axios.get(`${services.classroom}/disciplinary-control/level-offenses`).then((response) => response.data);
  }
}
