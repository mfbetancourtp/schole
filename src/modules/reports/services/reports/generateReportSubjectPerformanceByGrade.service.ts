import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportSubjectPerformanceByGradeService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/performance-subjects-by-grade`, data)
            .then(response => response.data);
    }
}