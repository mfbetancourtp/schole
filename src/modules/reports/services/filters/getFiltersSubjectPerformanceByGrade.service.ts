import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectsCategoryDto} from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersSubjectPerformanceByGradeService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    subjectCategories: SubjectsCategoryDto[];
    options: any;
}

export class GetFiltersSubjectPerformanceByGradeService {
    async run() {
        return axios.get<IGetFiltersSubjectPerformanceByGradeService>(`${services.reports}/filters/related-data-performance-subjects-by-grade`)
            .then(response => response.data);
    }
}
