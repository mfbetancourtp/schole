import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPeriodsPlanningsWeeksFormService {
  run(courseId: number) {
    return axios
      .get(
        `${services.academic}/academic-planning/periods-by-params/${courseId}`
      )
      .then((response) => response.data);
  }
}
