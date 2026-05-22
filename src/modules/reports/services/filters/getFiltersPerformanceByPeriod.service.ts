import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectsCategoryDto} from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersPerformanceByPeriodService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    subjectCategories: SubjectsCategoryDto[];
    options: any;
}

export class GetFiltersPerformanceByPeriodService {
    async run() {
        return axios.get<IGetFiltersPerformanceByPeriodService>(`${services.reports}/filters/related-data-performance-by-group`)
            .then(response => response.data);
    }
}
