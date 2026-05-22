import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class GetDataThirdReportDetailedService {
  run(curriculumSubjectId: number, status: number) {
    return axios
      .get<any>(`${services.organizational}/third-development-map-report-detailed`, {
        params: {
          curriculumSubjectId,
          status,
        },
      })
      .then((response) => response.data);
  }
}
