import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConceptByIdService {
    async run(id: number) {
        return axios.get(`${services.casurid}/admin-concepts/${id}`)
            .then(response => response.data);
    }
}