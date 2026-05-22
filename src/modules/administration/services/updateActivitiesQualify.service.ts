import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';


export class UpdateActivitiesQualifyService {
    async run(courseId: any, data: any): Promise<void> {
        await axios.put(`${services.classroom}/classroom-assessment/courses/update-activities-grades?courseId=${courseId}`, data);
    }
}