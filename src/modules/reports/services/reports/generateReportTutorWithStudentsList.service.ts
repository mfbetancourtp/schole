import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportTutorWithStudentsListService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/list-students-by-structure`, data)
            .then(response => response.data);
    }
}