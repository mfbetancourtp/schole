import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetIdentificationTypesService {
    async run() {
        return axios.get<any[]>(`${services.users}/people/identification-types`)
            .then(response => response.data);
    }
}