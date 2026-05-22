import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportPerformancePerPeriodService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/perfomance-by-level`, data)
            .then(response => response.data);
    }
}