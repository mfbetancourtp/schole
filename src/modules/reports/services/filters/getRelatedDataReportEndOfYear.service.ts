import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export interface IGetFiltersStudentPerformanceService {
  subjectCategories: any;
  academicPeriods: any;
  options: any;
}

export class GetRelatedDataReportEndOfYearService {
  async run() {
    return axios.get<any>(`${services.reports}/filters/related-data-student-summary-averages-half-unit-student`).then((response) => response.data);
  }
}
