import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAnnouncementService {
  async run(id: number, itemId: number): Promise<void> {
    await axios.delete(`${services.communications}/announcements/${id}/permissions-by-item/${itemId}`);
  }
}
