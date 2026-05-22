import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAreasByAcademicPeriodAndSpecialistIdService {
    run(academicPeriodId: number, specialistId: number) {
        return axios.get(`${services.academic}/academic-planning/academic-periods/${academicPeriodId}/specialists/${specialistId}/areas`)
            .then(response => response.data);
    }
}