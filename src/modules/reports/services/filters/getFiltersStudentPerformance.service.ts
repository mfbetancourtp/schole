import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersStudentPerformanceService {
    subjectCategories: SubjectCategorieDto[];
    academicPeriods: AcademicPeriodDto[];
    options: any;
}

export class GetFiltersStudentPerformanceService {
    async run() {
        return axios.get<IGetFiltersStudentPerformanceService>(`${services.reports}/filters/related-data-student-performance`)
            .then(response => response.data);
    }
}
