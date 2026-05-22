import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class ExportPaymentsService {
    async run(data: any): Promise<void> {
        return await axios.post(`${services.casurid}/export-payments`, data)
            .then(response => response.data);
    }
}