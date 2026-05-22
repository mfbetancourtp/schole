import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetPeriodicityTypeRepeatService {
  run() {
    return axios.get(`${services.configurations}/periodicity-type-repeat`).then((response) => response.data);
  }
}
