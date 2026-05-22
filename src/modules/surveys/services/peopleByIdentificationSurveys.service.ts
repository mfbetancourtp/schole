import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PeopleByIdentificationSurveysService {
    async run(params: any) {
        return axios.get<any>(`${services.users}/people/general/people-by-identification-surveys`, {params})
            .then(response => response.data);
    }
}