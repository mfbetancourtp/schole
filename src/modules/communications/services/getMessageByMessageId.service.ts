import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMessageByMessageIdService {
  async run(messageId: number) {
    return axios.get(`${services.communications}/messages/${messageId}`).then((response) => response.data);
  }
}
