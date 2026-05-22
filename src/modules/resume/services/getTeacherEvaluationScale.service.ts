import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { TeacherEvaluationScaleDto } from '../dtos/teacherEvaluationScale.dto';

interface TeacherEvaluationScaleDetailResponseDto {
  data: TeacherEvaluationScaleDto;
}

export class GetTeacherEvaluationScaleService {
  run(teacherEvaluationScaleId: number | string): Promise<TeacherEvaluationScaleDto> {
    return axios.get<TeacherEvaluationScaleDto | TeacherEvaluationScaleDetailResponseDto>(`${services.structure}/teacher-evaluation-scales/${teacherEvaluationScaleId}`).then((response) => {
      const responseData = response.data;

      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data;
      }

      return responseData;
    });
  }
}
