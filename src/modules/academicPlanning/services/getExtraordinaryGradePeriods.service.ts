import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
  periodId: number;
}

export class GetExtraordinaryGradePeriods {
  run(params: any) {
    return axios
      .get<any>(`${services.academic}/academic-planning/period/${params.periodId}/extraordinary-grade-periods`, {
        params: Object.fromEntries(Object.entries(params).filter(([key]) => key !== 'periodId' && key !== 'order')),
      })
      .then((response) => response.data);
  }
}
