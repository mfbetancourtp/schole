import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class SendEmailReportsObserverToParentsService {
    async run(params: any): Promise<any> {
        return axios.post(`${services.reports}/send-observer-reports-to-parents`, params)
            .then(response => response.data);
    }
}
