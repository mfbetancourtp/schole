import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetDataPeriodicityService {
  run(periodicityId: any) {
    return axios.get(`${services.configurations}/periodicity-by-id/${periodicityId}`).then((response) => response.data);
  }
}
