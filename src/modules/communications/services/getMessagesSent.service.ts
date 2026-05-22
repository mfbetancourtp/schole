import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetMessagesSentService {
  async run(params?: ParamsPaginationDto) {
    return axios.get(`${services.communications}/messages-sent`, { params }).then((response) => response.data);
  }
}
