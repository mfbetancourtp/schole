import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class PatchMessageOpenService {
  async run(messageId: number) {
    return axios.patch(`${services.communications}/messages/${messageId}/open`).then((response) => response.data);
  }
}
