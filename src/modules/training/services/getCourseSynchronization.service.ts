import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface IGetCourseSynchronizationService {
  forceCreationCourse: number;
  forceCreationUsers: number;
}
export class GetCourseSynchronizationService {
  run(courseId: number, params: IGetCourseSynchronizationService) {
    return axios.get(`${services.classroom}/classroom-administration/course-synchronization/${courseId}`, { params }).then((response) => response.data);
  }
}
