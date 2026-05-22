import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAllLevelTypesWithoutPaginationService {
  async run(params: any) {
    return axios.get(`${services.structure}/levelTypes/getAll`, { params }).then((response) => response.data);
  }
}
