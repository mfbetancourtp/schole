import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetSpecialistsByAcademicPeriodService {
    run(academicPeriodId: number) {
        return axios.get(`${services.academic}/academic-planning/academic-periods/${academicPeriodId}/specialists`)
            .then(response => response.data);
    }
}