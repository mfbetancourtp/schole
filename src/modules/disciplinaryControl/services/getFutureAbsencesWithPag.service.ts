import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { DTFutureAbsencesDto, ParamsDTFutureAbsencesDto } from '../dtos/futureAbsences.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';

export class GetFutureAbsencesWithPagService {
  run(params: ParamsDTFutureAbsencesDto) {
    return axios.get<ResponsePaginationDto<DTFutureAbsencesDto>>(`${services.classroom}/classroom-implementation/future-absences-with-pagination`, { params }).then((response) => response.data);
  }
}
