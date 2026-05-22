import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { StudentCategoryDto } from '../../../../shared/dto/studentCategory.dto';
import { SubjectsCategoryDto } from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersBookGradeService {
  studentCategories: StudentCategoryDto[];
  subjectCategories: SubjectsCategoryDto[];
  academicPeriods: any;
  typeBulletin: number;
}

export class GetFiltersBookGradeService {
  async run() {
    return axios.get<IGetFiltersBookGradeService>(`${services.reports}/filters/related-data-report-card-by-group-book-rating`).then((response) => response.data);
  }
}
