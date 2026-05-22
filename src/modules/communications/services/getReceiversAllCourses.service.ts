import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetReceiversAllCoursesService {
  async run() {
    return axios.get(`${services.communications}/messages/receivers-all-courses`).then((response) => response.data);
  }
}
