import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export class LockUnlockReportService {
    async run(reportStoreId: number, disabledSend: boolean): Promise<any> {
        return axios.post(`${services.reports}/report-store/${reportStoreId}`, {disabledSend})
            .then(response => response.data);
    }
}