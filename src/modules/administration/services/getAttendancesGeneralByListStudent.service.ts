
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAttendancesGeneralByListStudentService {
    run(courseId: any) {
        return axios.get(`${services.classroom}/classroom-implementation/sessions-ids/attendances?sessionIds=[${courseId}]`)
            .then(response => response.data);
    }
} 