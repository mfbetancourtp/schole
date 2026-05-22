import axios from '../../../utils/axios';
import {services} from '../../../constant/services';

export class RelatedDataProcessPaymentService {
    run() {
        return axios.get(`${services.payments}/pague-a-tiempo/related-data`).then(response => response.data);
    }
}
