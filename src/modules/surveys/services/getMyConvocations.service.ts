import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetMyConvocationsService {
    async run() {
        return axios.get<any>(`${services.academic}/academic-planning/my-convocations`)
            .then(response => response.data);
    }
}