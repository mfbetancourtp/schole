import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSubjectAssignmentsService {
    run(academicPeriodGroupId: number | string) {
        return axios.get(`${services.academic}/academic-planning/academic-period-groups/${academicPeriodGroupId}/subject-assignments`)
            .then(response => response.data);
    }
}