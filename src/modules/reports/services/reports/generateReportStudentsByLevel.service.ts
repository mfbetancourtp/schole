import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStudentsByLevelService {
    async run(params: any): Promise<any> {
        return axios.post(`${services.reports}/student-list-by-level-or-degree`, params).then(response => response.data);
    }
}
