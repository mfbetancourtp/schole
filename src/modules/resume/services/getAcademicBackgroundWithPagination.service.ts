import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAcademicBackgroundWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/academic-backgrounds`, { params }).then((response) => response.data);
  }
}
