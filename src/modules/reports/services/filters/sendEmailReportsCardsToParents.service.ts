import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class SendEmailReportsCardsToParentsService {
    async run(params: any): Promise<any> {
        return axios.post(`${services.reports}/send-reports-cards-to-parents`, params)
            .then(response => response.data);
    }
}
