import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetActivitiesDashboardFilterService {
    run(courseId: any) {
        return axios.get(`${services.classroom}/classroom-assessment/activities-dashboard?courseId=${courseId}`)
            .then(response => response.data);
    }
}