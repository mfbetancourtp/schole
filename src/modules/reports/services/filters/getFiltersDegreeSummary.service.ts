import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersDegreeSummaryService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersDegreeSummaryService {
    async run() {
        return axios.get<IGetFiltersDegreeSummaryService>(`${services.reports}/filters/related-data-degree-summary`).then(response => response.data);
    }
}
