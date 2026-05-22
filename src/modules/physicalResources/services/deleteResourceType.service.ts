import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteResourceTypeService {
  run(id: number) {
    return axios.delete(`${services.academic}/resource-types/${id}`).then((response) => response.data);
  }
}
