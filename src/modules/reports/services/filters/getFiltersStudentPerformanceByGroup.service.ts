import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersStudentPerformanceByGroupService {
    subjectCategories: SubjectCategorieDto[];
    studentCategories: StudentCategoryDto[];
    academicPeriods: AcademicPeriodDto[];
    options: any;
}

export class GetFiltersStudentPerformanceByGroupService {
    async run() {
        return axios.get<IGetFiltersStudentPerformanceByGroupService>(`${services.reports}/filters/related-data-students-performance-by-group`)
            .then(response => response.data);
    }
}
