import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetIntellectualProductionsWithPaginationService {
  run(params: any) {
    return axios.get(`${services.structure}/intellectual-productions`, { params }).then((response) => response.data);
  }
}
