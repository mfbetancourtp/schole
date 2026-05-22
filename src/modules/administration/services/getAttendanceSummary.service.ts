import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetAttendanceSummaryService {
    run(courseId: any, date: any) {
        return axios.get(`${services.classroom}/classroom-implementation/attendances/attendance-summary/${courseId}?dateSince=${date.start}&dateUntil=${date.end}`)
            .then(response => response.data);
    }
}