import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetMessagesOwnerPeopleService {
  async run(messageId: any) {
    return axios.get(`${services.communications}/messages/${messageId}/owner-people`).then((response) => response.data);
  }
}
