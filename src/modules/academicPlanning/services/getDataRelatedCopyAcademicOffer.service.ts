import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDataRelatedCopyAcademicOfferService {
    run() {
        return axios.get(`${services.academic}/academic-planning/academic-period-groups-related-data-form`)
            .then(response => response.data);
    }
}