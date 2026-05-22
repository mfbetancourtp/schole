import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportDegreeSummaryQuickViewService {
    async run(params: any): Promise<any> {
        return axios.post(`${services.reports}/grade-summary-by-day/${params.academicPeriodGroupId}`, params).then(response => response.data);
    }
}
