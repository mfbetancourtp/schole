import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetPeopleByIdentificationService {
    run(identification: string) {
        return axios.get(`${services.users}/people/general/people-by-identification/${identification}`)
            .then(response => response.data);
    }
}