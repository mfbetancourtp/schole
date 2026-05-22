import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetWorkExperiencesWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/workExperiences`, { params }).then((response) => response.data);
  }
}
