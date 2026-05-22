import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteHierarchicalLevelService {
  run(id: number) {
    return axios.delete(`${services.academic}/hierarchical-levels/${id}`).then((response) => response.data);
  }
}
