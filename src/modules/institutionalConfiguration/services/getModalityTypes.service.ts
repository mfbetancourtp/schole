import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetModalityTypesService {
  run(params?: any) {
    return axios.get(`${services.structure}/modality-types`, { params }).then((response) => response.data);
  }
}
