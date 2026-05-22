import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetConvocationsDegreesService {
    async run(convocationId: any) {
        return axios.get<any[]>(`${services.academic}/academic-planning/convocations/${convocationId}/degrees`)
            .then(response => response.data);
    }
}