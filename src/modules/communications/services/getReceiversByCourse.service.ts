import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
// import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetReceiversByCourseService {
  async run(params?: any) {
    return axios
      .get(`${services.communications}/messages/receivers-by-course`, {
        params,
      })
      .then((response) => response.data);
  }
}
