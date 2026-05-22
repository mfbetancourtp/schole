import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelatedDataProfileService {
    async run() {
        return axios.get(`${services.users}/people/general/related-data-profile`)
            .then(response => response.data);
    }
}