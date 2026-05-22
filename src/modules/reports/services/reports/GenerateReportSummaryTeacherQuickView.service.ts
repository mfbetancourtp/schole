import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportSummaryTeacherQuickViewService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/grade-summary-by-user-teacher/${data.teacherId}`, data)
            .then(response => response.data);
    }
}