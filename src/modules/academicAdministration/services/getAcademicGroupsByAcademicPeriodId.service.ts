import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAcademicGroupsByAcademicPeriodIdService {
    run(academicPeriodId: any) {
        return axios.get(`${services.academic}/academic-planning/academic-periods/${academicPeriodId}/academic-period-groups-all`)
            .then(response => response.data);
    }
}