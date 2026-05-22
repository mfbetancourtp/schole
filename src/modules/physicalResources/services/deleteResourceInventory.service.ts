import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteResourceInventoryService {
  run(id: number) {
    return axios.delete(`${services.academic}/resources/${id}`).then((response) => response.data);
  }
}
