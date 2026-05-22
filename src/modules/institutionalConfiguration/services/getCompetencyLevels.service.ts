import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetCompetencyLevelsService {
    run() {
        return axios.get(`${services.classroom}/classroom-administration/competencyLevels`)
            .then(response => response.data);
    }
}