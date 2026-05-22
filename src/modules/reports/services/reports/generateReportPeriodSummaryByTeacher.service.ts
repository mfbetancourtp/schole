import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportPeriodSummaryByTeacherService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/period-summary-by-user-teacher/${data.teacherId}`, data)
            .then(response => response.data);
    }
}