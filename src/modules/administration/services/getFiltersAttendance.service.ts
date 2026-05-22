import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetFiltersAttendanceService {
    run() {
        return axios.get(`${services.reports}/filters/related-data-attendance-by-course-and-dates`)
            .then(response => response.data);
    }
}