import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportCardsByLevelService {
    async run(data: any): Promise<any> {
        return axios.post(`${services.reports}/cards-by-level`, data)
            .then(response => response.data);
    }
}