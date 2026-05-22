import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { StudentCategoryDto } from '../../../../shared/dto/studentCategory.dto';
import { SubjectsCategoryDto } from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersCardByGroupFinalService {
  studentCategories: StudentCategoryDto[];
  subjectCategories: SubjectsCategoryDto[];
  academicPeriods: any;
  options: any;
  typeBulletin: number;
}

export class GetFiltersCardByGroupFinalService {
  async run() {
    return axios.get<IGetFiltersCardByGroupFinalService>(`${services.reports}/filters/related-data-report-card-by-group-final`).then((response) => response.data);
  }
}
