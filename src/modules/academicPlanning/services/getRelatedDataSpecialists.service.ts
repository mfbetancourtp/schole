import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelatedDataSpecialistsService {
    run() {
        return axios.get(`${services.academic}/academic-planning/academic-period-specialists-related-data-form`)
            .then(response => response.data);
    }
}