import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetAcademicPeriodsWithPaginationService {
  async run(params: ParamsPaginationDto) {
    return axios.get(`${services.academic}/academic-periods/pagination`, { params }).then((response) => response.data);
  }
}
