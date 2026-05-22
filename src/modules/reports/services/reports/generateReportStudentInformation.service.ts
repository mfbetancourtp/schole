import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportStudentInformationService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/student-information/${data.userId}`, data)
            .then(response => response.data);
    }
}