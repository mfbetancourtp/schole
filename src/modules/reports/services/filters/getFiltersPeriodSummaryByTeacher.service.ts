import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectsCategoryDto} from '../../../../shared/dto/subjectsCategory.dto';

export interface IGetFiltersPeriodSummaryByTeacherService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    subjectCategories: SubjectsCategoryDto[];
    options: any;
}

export class GetFiltersPeriodSummaryByTeacherService {
    async run() {
        return axios.get<IGetFiltersPeriodSummaryByTeacherService>(`${services.reports}/filters/related-data-period-summary-by-teacher`)
            .then(response => response.data);
    }
}
