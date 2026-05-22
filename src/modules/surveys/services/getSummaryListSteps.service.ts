import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSummaryListStepsService {
    async run(convocationId: any) {
        return axios.get(`${services.academic}/academic-planning/${convocationId}/convocation-steps-summary`)
            .then(response => response.data);
    }
}