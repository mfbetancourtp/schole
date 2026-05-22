import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSpaceTypeService {
  run(id: number) {
    return axios.delete(`${services.academic}/space-types/${id}`).then((response) => response.data);
  }
}
