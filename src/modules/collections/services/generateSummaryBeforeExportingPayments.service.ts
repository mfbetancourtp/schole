import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateSummaryBeforeExportingPaymentsService {
    async run(data: any) {
        return await axios.post<any[]>(`${services.casurid}/payments-by-dates`, data)
            .then(response => response.data);
    }
}