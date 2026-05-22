import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GerMessagesErasersService {
  async run(params?: ParamsPaginationDto) {
    return axios.get(`${services.communications}/messages-erasers`, { params }).then((response) => response.data);
  }
}
