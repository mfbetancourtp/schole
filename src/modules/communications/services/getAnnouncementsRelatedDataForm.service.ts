import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAnnouncementsRelatedDataFormService {
  async run() {
    return axios.get<any>(`${services.communications}/announcements-related-data-form`).then((response) => response.data);
  }
}
