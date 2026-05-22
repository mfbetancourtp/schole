import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSummaryinscritosByStepService {
    async run(params: any) {
        return axios.get(`${services.academic}/academic-planning/${params.convocationStepId}/convocation-enrol-steps`, { params })
            .then(response => response.data);
    }
}