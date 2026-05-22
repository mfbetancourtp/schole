import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAllTranslationsByParamsService {
    async run(interfaceId : number, languageId : number | null = null) {
        return axios.
            get<any>(`${services.admin}/languages-translations/translations-params`, {
                params: {
                    interfaceId, languageId
                }
            }
        )
        .then((response) => response.data);
    }
}