import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetContentByIdService {
    run(contentId: string) {
        return axios.get(`${services.casurid}/catalogue/admin/contents/${contentId}`).then(response => response.data);
    }
}