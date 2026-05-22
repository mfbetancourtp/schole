import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetRelatedDataAllowContentsService {
    run() {
        return axios.get(`${services.lti}/integrations/lti/related-data-allow-contents`).then((response) => {
            return response.data;
        });
    }
}