import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetGroupPromotionRelatedDataService {
    run(academicPeriodGroupId: number) {
        return axios.get(`${services.academic}/academic-administration/group-promotion-related-data/${academicPeriodGroupId}`)
            .then(response => response.data);
    }
}