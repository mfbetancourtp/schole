import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAbseceTypesService {
  run() {
    return axios.get(`${services.classroom}/classroom-implementation/absence-types`).then((response) => response.data);
  }
}
