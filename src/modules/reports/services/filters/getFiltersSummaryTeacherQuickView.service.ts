import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersSummaryTeacherQuickViewService {
    subjectCategories: SubjectCategorieDto[];
    studentCategories: StudentCategoryDto[];
    academicPeriods: AcademicPeriodDto[];
    options: any;
}

export class GetFiltersSummaryTeacherQuickViewService {
    async run() {
        return axios.get<IGetFiltersSummaryTeacherQuickViewService>(`${services.reports}/filters/related-data-grade-summary-by-teacher`)
            .then(response => response.data);
    }
}
