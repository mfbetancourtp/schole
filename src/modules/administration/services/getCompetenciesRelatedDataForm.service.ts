import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetCompetenciesRelatedDataFormService {
    run() {
        return axios.get(`${services.classroom}/classroom-administration/competencies-related-data-form`)
            .then(response => response.data);
    }
}