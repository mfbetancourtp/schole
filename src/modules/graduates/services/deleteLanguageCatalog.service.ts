import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteLanguageCatalogService {
  run(id: number) {
    return axios.delete(`${services.structure}/languages/${id}`).then((r) => r.data);
  }
}
