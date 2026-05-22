import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { TeacherEvaluationScaleDto, TeacherEvaluationScaleResponseDto } from '../dtos/teacherEvaluationScale.dto';

export interface GetTeacherEvaluationScalesParams {
  noPag?: boolean;
  page?: number;
  perPage?: number;
  id?: number | string;
}

export class GetTeacherEvaluationScalesService {
  run(params?: GetTeacherEvaluationScalesParams): Promise<TeacherEvaluationScaleResponseDto | TeacherEvaluationScaleDto[]> {
    return axios.get<TeacherEvaluationScaleResponseDto | TeacherEvaluationScaleDto[]>(`${services.structure}/teacher-evaluation-scales`, { params }).then((response) => response.data);
  }
}
