import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class RelatedDataCollectionStepsService {
    run() {
        return axios.get(`${services.collections}/related-data-collection-steps`)
            .then(response => response.data);
    }
}