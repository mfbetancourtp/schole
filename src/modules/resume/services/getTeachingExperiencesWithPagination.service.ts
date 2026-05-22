import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTeachingExperiencesWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/teaching-experiences`, { params }).then((response) => response.data);
  }
}
