import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersPerformanceByStudentService {
    academicPeriods: AcademicPeriodDto[];
    subjectCategories: SubjectCategorieDto[];
    options: any;
}

export class GetFiltersPerformanceByStudentService {
    async run() {
        return axios.get<IGetFiltersPerformanceByStudentService>(`${services.reports}/filters/related-data-performance-by-student`)
            .then(response => response.data);
    }
}
