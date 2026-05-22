import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersPerformanceSummaryService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersPerformanceSummaryService {
    async run() {
        return axios.get<IGetFiltersPerformanceSummaryService>(`${services.reports}/filters/related-data-performance-summary`)
            .then(response => response.data);
    }
}
