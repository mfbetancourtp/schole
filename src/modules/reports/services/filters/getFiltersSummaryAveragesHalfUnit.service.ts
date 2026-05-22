import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { AcademicPeriodDto } from '../../../../shared/dto/academicPeriod.dto';
import { StudentCategoryDto } from '../../../../shared/dto/studentCategory.dto';
import { SubjectsCategoryDto } from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersSummaryAveragesHalfUnitService {
  academicPeriods?: AcademicPeriodDto[] | any;
  studentCategories?: StudentCategoryDto[] | any;
  subjectCategories?: SubjectsCategoryDto[] | any;
  options?: any;
}

export class GetFiltersSummaryAveragesHalfUnitService {
  async run() {
    return axios.get<IGetFiltersSummaryAveragesHalfUnitService>(`${services.reports}/filters/related-data-student-summary-averages-half-unit`).then((response) => response.data);
  }
}
