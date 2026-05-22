import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersAttendanceControlService {
    academicPeriods: AcademicPeriodDto[];
    subjectCategories: SubjectCategorieDto[];
}

export class GetFiltersAttendanceControlService {
    run() {
        return axios.get<IGetFiltersAttendanceControlService>(`${services.reports}/filters/related-data-attendance-control`)
            .then(response => response.data);
    }
}
