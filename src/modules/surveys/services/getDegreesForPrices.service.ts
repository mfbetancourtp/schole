import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDegreesForPricesService {
    async run() {
        return axios.get(`${services.academic}/academic-programs/degrees`)
            .then(response => response.data);
    }
}