import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAttendancesGeneralByDateService {
    run(courseId: any) {
        return axios.get(`${services.academic}/academic-planning/academic-period-groups-general/${courseId}`)
            .then(response => response.data);
    }
}
