import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetRelatedDataPortfolioMonitoringByStudentService {
    run(matriculateId: number) {
        return axios.get(`${services.casurid}/payments/matriculate/${matriculateId}/related-data-invoice-quotes`)
            .then(response => response.data);
    }
}