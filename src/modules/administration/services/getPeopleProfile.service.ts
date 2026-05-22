import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetPeopleProfileService {
    async run(userId: number) {
        return axios.get(`${services.users}/people/general/profile/${userId}`)
            .then(response => response.data);
    }
}