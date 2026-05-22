import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteSkillCategoryService {
  run(id: number) {
    return axios.delete(`${services.graduates}/skill-categories/${id}`).then((r) => r.data);
  }
}
