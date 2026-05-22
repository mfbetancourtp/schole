import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConvocationsActivesService {
    async run(params: any) {
        return axios.get<any>(`${services.academic}/academic-planning/convocations-actives`, {params})
        .then(response => response.data);
    }
}