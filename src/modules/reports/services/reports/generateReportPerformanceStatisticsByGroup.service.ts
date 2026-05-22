import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportPerformanceStatisticsByGroupService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/performance-statistics-by-academic-period-group/${data.academicPeriodGroupId}`, data)
            .then(response => response.data);
    }
}