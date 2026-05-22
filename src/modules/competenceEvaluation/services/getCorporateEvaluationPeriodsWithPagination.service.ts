import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { EvaluationConfigurationDto } from '../dtos/configureEvaluations.dto';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';

interface IParams extends ParamsPaginationDto {
  unitOrganizationalId: number;
  academicPeriodId: number;
  startDate: string;
  endDate: string;
}

export class GetCorporateEvaluationPeriodsWithPaginationService {
  run(params?: IParams) {
    return axios.get<ResponsePaginationDto<EvaluationConfigurationDto>>(`${services.corporate}/corporate-evaluation-periods-with-pagination`, { params }).then((response) => response.data);
  }
}
