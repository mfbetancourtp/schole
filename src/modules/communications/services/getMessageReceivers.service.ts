import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { MessageReceiverDto } from '../dtos/message.dto';

export class GetMessageReceiversService {
  async run(messageId: number) {
    return axios.get<MessageReceiverDto[]>(`${services.communications}/messages/${messageId}/message-receivers`).then((response) => response.data);
  }
}
