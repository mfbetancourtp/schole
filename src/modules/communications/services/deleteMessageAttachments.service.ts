import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMessageAttachmentsService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.communications}/message-attachments/${id}`);
  }
}
