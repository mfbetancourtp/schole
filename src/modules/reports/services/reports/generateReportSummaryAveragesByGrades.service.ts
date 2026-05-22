import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportSummaryAveragesByGradesService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/summary-averages-by-grade`, data)
            .then(response => response.data);
    }
}