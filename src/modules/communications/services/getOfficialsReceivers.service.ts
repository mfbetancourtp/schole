import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { OfficialsReceiverDto } from '../dtos/message.dto';

export class GetOfficialsReceiversService {
  async run() {
    return axios.get<OfficialsReceiverDto[]>(`${services.communications}/messages/officials-receivers`).then((response) => response.data);
  }
}
