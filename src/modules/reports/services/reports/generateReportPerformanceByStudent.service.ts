import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportPerformanceByStudentService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/perfomance-by-user-student/${data.userId}`, data)
            .then(response => response.data);
    }
}