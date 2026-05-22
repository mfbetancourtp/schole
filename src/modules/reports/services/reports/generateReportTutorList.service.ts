import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportTutorListService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/list-tutors-by-structure`, data)
            .then(response => response.data);
    }
}