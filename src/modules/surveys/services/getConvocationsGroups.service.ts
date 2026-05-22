import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConvocationsGroupsService {
    async run(convocationId: any, convocationEnrolId: any) {
        return axios.get<any[]>(`${services.academic}/academic-planning/convocations/${convocationId}/groups?convocationEnrolId=${convocationEnrolId}`)
            .then(response => response.data);
    }
}