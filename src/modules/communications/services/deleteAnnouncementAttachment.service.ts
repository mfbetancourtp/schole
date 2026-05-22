import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAnnouncementAttachmentService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.communications}/announcement-attachments/${id}`);
  }
}
