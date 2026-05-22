import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportDailyAttendanceService {
    run(params: any) {
        return axios.get(`${services.reports}/attendances-by-day-and-course/${params.academicPeriodGroupId}`, {
            params,
        }).then(response => response.data);
    }
}
