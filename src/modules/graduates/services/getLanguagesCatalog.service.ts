import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetLanguagesCatalogService {
  run() {
    return axios.get(`${services.structure}/languages`).then((r) => r.data);
  }
}
