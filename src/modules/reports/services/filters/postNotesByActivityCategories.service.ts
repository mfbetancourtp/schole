import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class PostNotesByActivityCategoriesService {
  run(data: any) {
    return axios.post(`${services.reports}/notes-by-activity-categories`, data).then((response) => response.data);
  }
}
