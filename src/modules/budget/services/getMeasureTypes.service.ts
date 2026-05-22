import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetMeasureTypesService {
  run() {
    return axios.get(`${services.budget}/admin/measure-types`).then((response) => response.data);
  }
}
