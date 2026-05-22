import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStudentPerformanceByGroupService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/students-perfomance-by-academic-period-group/${data.academicPeriodGroupId}`, data)
            .then(response => response.data);
    }
}