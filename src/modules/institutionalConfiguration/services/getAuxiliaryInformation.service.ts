import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAuxiliaryInformationService {
    run() {
        return axios.get(`${services.academic}/institutional-configuration/auxiliary-information`)
            .then(response => response.data);
    }
}