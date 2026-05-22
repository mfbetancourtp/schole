import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetCollectionStepsService {
    run() {
        return axios.get(`${services.collections}/collection-steps`)
            .then(response => response.data);
    }
}