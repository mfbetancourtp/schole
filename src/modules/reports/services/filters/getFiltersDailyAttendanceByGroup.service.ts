import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersDailyAttendanceByGroupService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersDailyAttendanceByGroupService {
    run() {
        return axios.get<IGetFiltersDailyAttendanceByGroupService>(`${services.reports}/filters/related-data-attendance-by-course-and-dates`).then(response => response.data);
    }
}
