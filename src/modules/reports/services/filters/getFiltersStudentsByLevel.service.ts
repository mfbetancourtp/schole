import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { AcademicPeriodDto } from '../../../../shared/dto/academicPeriod.dto';

export interface IGetFiltersStudentsByLevelService {
  academicPeriods: AcademicPeriodDto[];
  sections: {};
}

export class GetFiltersStudentsByLevelService {
  async run() {
    return axios.get<IGetFiltersStudentsByLevelService>(`${services.reports}/filters/related-data-student-list-new`).then((response) => response.data);
  }
}
