import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetAnnouncementsWithPaginationService {
  run(params: ParamsPaginationDto) {
    return axios.get(`${services.communications}/announcements`, { params }).then((response) => response.data);
  }
}
