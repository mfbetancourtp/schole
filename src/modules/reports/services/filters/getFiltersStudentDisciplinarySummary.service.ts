import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';

export interface IGetFiltersStudentDisciplinarySummaryService {
    academicPeriods: AcademicPeriodDto[];
}

export class GetFiltersStudentDisciplinarySummaryService {
    async run() {
        return axios.get<IGetFiltersStudentDisciplinarySummaryService>(`${services.reports}/filters/related-data-period-summary-by-group`)
            .then(response => response.data);
    }
}
