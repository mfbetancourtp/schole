import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetActivitiesDashboardService {
    run(courseId: any, periodId: any) {
        return axios.get(`${services.classroom}/classroom-assessment/activities-dashboard?courseId=${courseId}&periodId=${periodId}`)
            .then(response => response.data);
    }
}