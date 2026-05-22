import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportDisabledStudentsReportCardService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/students-disabled-report-card`, data)
            .then(response => response.data);
    }
}