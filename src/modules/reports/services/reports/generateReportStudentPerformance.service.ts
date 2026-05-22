import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStudentPerformanceService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/student-perfomance/${data.userId}`, data)
            .then(response => response.data);
    }
}