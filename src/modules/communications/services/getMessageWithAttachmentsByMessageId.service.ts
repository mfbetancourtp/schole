import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { MessageDto } from '../dtos/message.dto';

export class GetMessageWithAttachmentsByMessageIdService {
  async run(messageId: number) {
    return axios.get<MessageDto>(`${services.communications}/messages/${messageId}/with-attachments`).then((response) => response.data);
  }
}
