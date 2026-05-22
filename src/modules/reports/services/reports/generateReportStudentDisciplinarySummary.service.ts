import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStudentDisciplinarySummaryService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/disciplinary-history-by-user-student/${params.userId}`, {
            params,
        }).then(response => response.data);
    }
}