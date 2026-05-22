import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConceptsService {
    async run() {
        return axios.get(`${services.casurid}/admin-concepts`)
            .then(response => response.data);
    }
}