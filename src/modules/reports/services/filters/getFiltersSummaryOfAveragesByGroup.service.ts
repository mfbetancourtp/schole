import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersSummaryOfAveragesByGroupService {
    subjectCategories: SubjectCategorieDto[];
    studentCategories: StudentCategoryDto[];
    academicPeriods: AcademicPeriodDto[];
    options: any;
}

export class GetFiltersSummaryOfAveragesByGroupService {
    async run() {
        return axios.get<IGetFiltersSummaryOfAveragesByGroupService>(`${services.reports}/filters/related-data-student-summary-averages-by-group`)
            .then(response => response.data);
    }
}
