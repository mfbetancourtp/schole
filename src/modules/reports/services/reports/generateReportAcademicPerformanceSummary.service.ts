import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportAcademicPerformanceSummaryService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/academic-performance-summary`, {
            params,
        }).then(response => response.data);
    }
}