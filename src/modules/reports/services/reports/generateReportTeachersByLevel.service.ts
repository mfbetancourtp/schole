import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportTeachersByLevelService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/list-teachers-by-structure`, data)
            .then(response => response.data);
    }
}