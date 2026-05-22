import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAttendancesBySessionIdService {
    run(sessionId: any) {
        return axios.get(`${services.classroom}/classroom-implementation/sessions/${sessionId}/attendances`)
            .then(response => response.data);
    }
}