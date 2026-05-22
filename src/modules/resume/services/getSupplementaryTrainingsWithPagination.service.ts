import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetSupplementaryTrainingsWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/supplementary-trainings`, { params }).then((response) => response.data);
  }
}
