import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetTeacherActivitiesService {
    run(courseId: number, params: any) {
        return axios.get(`${services.classroom}/classroom-assessment/courses/${courseId}/teacher-activities`, {params})
            .then(response => response.data);
    }
}