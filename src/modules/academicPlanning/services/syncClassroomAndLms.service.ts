import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ISyncClassroomAndLmsService {
  forceCreationCourse: number;
  forceCreationUsers: number;
  activities: number;
  syncLmsNew: number;
  categoryId: number | null;
  nameUseCourseCreated: string | null;
  lmsInstitutionPlatformId: number | null;
}
export class SyncClassroomAndLmsService {
  run(subjectAssignmentId: number, params: ISyncClassroomAndLmsService) {
    return axios.get(`${services.academic}/planning/offering-sections/${subjectAssignmentId}/sync-to-classroom`, { params }).then((response) => response.data);
  }
}
