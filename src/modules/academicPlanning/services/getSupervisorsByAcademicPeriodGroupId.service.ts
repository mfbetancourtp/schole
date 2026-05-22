import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSupervisorsByAcademicPeriodGroupIdService {
    run(academicPeriodGroupId: number) {
        return axios.get(`${services.academic}/academic-planning/academic-periods-groups/${academicPeriodGroupId}/supervisors`)
            .then(response => response.data);
    }
}