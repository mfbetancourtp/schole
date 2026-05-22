import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAcademicPeriodGroupsService {
    run(academicPeriodId: number) {
        return axios.get(`${services.academic}/academic-planning/academic-periods/${academicPeriodId}/academic-period-groups`)
            .then(response => response.data);
    }
}