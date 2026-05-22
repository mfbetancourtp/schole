import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAllLanguagesService {
    async run() {
        return axios.
            get<any>(`${services.admin}/languages-translations/languages`
        )
        .then((response) => response.data);
    }
}