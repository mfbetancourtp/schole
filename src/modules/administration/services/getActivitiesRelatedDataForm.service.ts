import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetActivitiesRelatedDataFormService {
    run(courseId: number, activityId?: any) {
        let param = activityId ? `?activityId=${activityId}` : '';

        return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/activities-related-data-form${param}`)
            .then(response => response.data);
    }
}