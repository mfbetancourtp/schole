
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAttendancesGeneralByListService {
    run(courseId: any) {
        return axios.get(`${services.classroom}/classroom-implementation/session-general/${courseId}`)
            .then(response => response.data);
    }
} 