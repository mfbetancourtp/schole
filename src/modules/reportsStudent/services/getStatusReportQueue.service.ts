import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetStatusReportQueueService {
    async run(reportId: string): Promise<any> {
        return axios.get(`${services.reports}/status-queue/${reportId}`).then((response) => response.data);
    }
}