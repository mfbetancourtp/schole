import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelationshipsService {
    async run() {
        return axios.get<any[]>(`${services.users}/people/relationships`)
            .then(response => response.data);
    }
}