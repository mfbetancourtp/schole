import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersDisabledStudentsReportCardService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersDisabledStudentsReportCardService {
    run() {
        return axios.get<IGetFiltersDisabledStudentsReportCardService>(`${services.reports}/filters/related-data-student-disabled-report-card`)
            .then(response => response.data);
    }
}
