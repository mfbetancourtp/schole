import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportDegreeSummaryService {
    async run(params: any): Promise<any> {
        return axios.post(`${services.reports}/degree-summary-by-academic-period-group/${params.academicPeriodGroupId}`, params).then(response => response.data);
    }
}
