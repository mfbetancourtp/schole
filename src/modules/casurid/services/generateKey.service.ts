import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GenerateKeyService {
    run() {
        return axios.get(`${services.casurid}/generate-key`)
            .then(response => response.data);
    }
}