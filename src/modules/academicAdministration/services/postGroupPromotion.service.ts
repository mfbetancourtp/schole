import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class PostGroupPromotionService {
    run(data: any) {
        return axios.post(`${services.academic}/academic-administration/group-promotion`, data)
            .then(response => response.data);
    }
}