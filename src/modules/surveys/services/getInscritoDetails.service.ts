import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetInscritoDetailsService {
    async run(convocationEnrolStepId: number, params: any) {
        return axios.get<any>(`${services.academic}/academic-planning/convocation-enrol-step-details/${convocationEnrolStepId}`, {params})
            .then(response => response.data);
    }
}