import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CorrectPaymentsService {
    async run(data: any): Promise<void> {
        return await axios.post(`${services.casurid}/correct-payments`, data)
            .then(response => response.data);
    }
}