import {services} from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class GetCollectionStepByIdService {
    run(collectionStepId: number) {
        return axios.get(`${services.collections}/collection-steps/${collectionStepId}`)
            .then(response => response.data);
    }
}