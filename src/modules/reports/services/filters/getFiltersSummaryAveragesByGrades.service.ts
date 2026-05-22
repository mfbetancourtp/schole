import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectsCategoryDto} from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersSummaryAveragesByGradesService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    subjectCategories: SubjectsCategoryDto[];
    options: any;
}

export class GetFiltersSummaryAveragesByGradesService {
    async run() {
        return axios.get<IGetFiltersSummaryAveragesByGradesService>(`${services.reports}/filters/related-data-student-summary-averages-by-grade`)
            .then(response => response.data);
    }
}