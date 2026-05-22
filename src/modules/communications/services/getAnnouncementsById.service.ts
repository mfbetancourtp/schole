import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAnnouncementsByIdService {
  async run(announcementId: number) {
    return axios.get<any>(`${services.communications}/announcements/${announcementId}/preview`).then((response) => response.data);
  }
}
