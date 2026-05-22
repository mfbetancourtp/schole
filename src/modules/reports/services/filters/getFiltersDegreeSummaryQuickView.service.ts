import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectsCategoryDto} from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersDegreeSummaryQuickViewService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    subjectCategories: SubjectsCategoryDto[];
    options: any;
}

export class GetFiltersDegreeSummaryQuickViewService {
    async run() {
        return axios.get<IGetFiltersDegreeSummaryQuickViewService>(`${services.reports}/filters/related-data-grade-summary-by-day`).then(response => response.data);
    }
}
