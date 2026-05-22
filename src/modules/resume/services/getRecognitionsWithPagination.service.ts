import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetRecognitionsWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/recognitions`, { params }).then((response) => response.data);
  }
}
