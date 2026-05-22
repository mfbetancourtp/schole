import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetPeriodsPlanningsWeeksService {
  run(courseId: number) {
    return axios
      .get(
        `${services.academic}/academic-planning/periods-by-apg-id/${courseId}`
      )
      .then((response) => response.data);
  }
}
