import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface MainTeacherResponseItem {
  offeringSubjectId: number;
  teacherName: string;
  teacherUserId: number;
  subjectName: string;
  userEvaluatorId: number | null;
  userEvaluatorName: string | null;
}

export interface GetMainTeachersPayload {
  academicPeriodId: number;
  programIds: string[];
  evaluationId: number | null;
}

export class GetMainTeachersService {
  run(payload: GetMainTeachersPayload): Promise<{ statusCode: number; data: MainTeacherResponseItem[] }> {
    const url = `${services.evaluationTeacher}/evaluations/main-teachers/list`;
    return axios.post(url, payload).then((response) => response.data);
  }
}
