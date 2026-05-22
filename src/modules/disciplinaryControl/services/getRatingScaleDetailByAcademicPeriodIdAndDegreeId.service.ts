import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

import { ParamsGetRatingScaleDetailByAcademicPeriodIdAndDegreeIdDto } from '../dtos/observerByUserId.dto';

export class GetRatingScaleDetailByAcademicPeriodIdAndDegreeIdService {
  run(params: ParamsGetRatingScaleDetailByAcademicPeriodIdAndDegreeIdDto) {
    return axios
      .get<any>(
        `
      ${services.academic}/academic-programs/rating-scale-details-by-degree-id/${params.academicPeriodId}/degree/${params.degreeId}`
      )
      .then((response) => response.data);
  }
}
