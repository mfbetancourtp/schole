import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetProfessionalProfilesNotPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/professional-profiles`, { params }).then((response) => response.data);
  }
}
