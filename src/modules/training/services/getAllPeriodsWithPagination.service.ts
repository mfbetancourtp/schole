import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { PeriodsDto } from '../dtos/budgetTracking.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';

export class GetAllPeriodsWithPaginationService {
  run(params?: ParamsPaginationDto, courseId?: number) {
    return axios
      .get<ResponsePaginationDto<PeriodsDto>>(`${services.classroom}/classroom-assessment/planning-weeks/periods-by-course?courseId=${courseId}`, {
        params,
      })
      .then((response) => response.data);
  }
}
