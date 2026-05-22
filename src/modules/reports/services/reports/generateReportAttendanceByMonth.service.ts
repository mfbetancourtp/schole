import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportAttendanceByMonthService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/attendances-by-course-and-dates/${params.academicPeriodGroupId}`, {
            params,
        }).then(response => response.data);
    }
}