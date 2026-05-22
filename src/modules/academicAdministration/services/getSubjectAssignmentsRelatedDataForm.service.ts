import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSubjectAssignmentsRelatedDataFormService {
    run(academicPeriodGroupId: number) {
        return axios.get(`${services.academic}/academic-planning/academic-period-groups/${academicPeriodGroupId}/subject-assignments-related-data-form`)
            .then(response => response.data);
    }
}