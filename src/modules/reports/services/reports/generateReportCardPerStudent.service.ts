import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportCardPerStudentService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/card-by-user-student/${data.userId}`, data)
            .then(response => response.data);
    }
}