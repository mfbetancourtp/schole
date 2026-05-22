import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetFiltersSummaryInscritosByStepService {
    async run(convocationStepId: any) {
        return axios.get<any>(`${services.academic}/academic-planning/filters-convocation-step-information?convocationStepId=${convocationStepId}`)
            .then(response => response.data);
    }
}