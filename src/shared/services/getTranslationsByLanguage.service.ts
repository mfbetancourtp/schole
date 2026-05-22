import axios from '../utils/axios';
import {services} from '../constant/services';

export class GetTranslationsByLanguageService {
    async run(language: string, key?: string): Promise<any> {
        const params: any = {};

        if (key) {
            params.key = key;
        }

        return axios.get<any>(`${services.users}/translations/${language}`, {
            params,
        }).then((response) => {
            return response.data;
        });
    }
}