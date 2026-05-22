import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetActivitiesCategoryService {
    run(courseId: any) {
        return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/activity-categories`)
            .then(response => response.data);
    }
}