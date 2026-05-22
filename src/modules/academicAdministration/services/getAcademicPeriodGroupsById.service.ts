import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAcademicPeriodGroupsByIdService {
    run(academicPeriodGroupById: number) {
        return axios.get(`${services.academic}/academic-planning/academic-period-groups/${academicPeriodGroupById}`)
            .then(response => response.data);
    }
}