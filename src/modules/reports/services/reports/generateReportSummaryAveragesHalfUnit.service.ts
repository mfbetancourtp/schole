import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportSummaryAveragesHalfUnitService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/summary-averages-half-unit`, data)
            .then(response => response.data);
    }
}