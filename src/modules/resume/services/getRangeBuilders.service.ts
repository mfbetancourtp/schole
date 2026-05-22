import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { RangeBuilderResponseDto } from '../dtos/rangeBuilder.dto';

export interface GetRangeBuildersParams {
  teacherEvaluationScaleId?: number | string;
  page?: number;
  perPage?: number;
  id?: number | string;
}

export class GetRangeBuildersService {
  run(params?: GetRangeBuildersParams) {
    return axios
      .get<RangeBuilderResponseDto>(`${services.structure}/range-builders`, {
        params: {
          ...params,
        },
      })
      .then((response) => response.data);
  }
}
