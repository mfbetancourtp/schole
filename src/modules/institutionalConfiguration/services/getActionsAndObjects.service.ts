import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetActionsAndObjectsservice {
    run() {
        return axios.get(`${services.reports}/system-audits/actions-objects`)
            .then(response => response.data);
    }
}