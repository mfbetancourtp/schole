import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class GenerateReportNotificationsReceptionService {
    async run(params: any): Promise<any> {
        return axios.get(`${services.reports}/reception-notifications-by-user/${params.userId}`, {
            params,
        }).then(response => response.data);
    }
}