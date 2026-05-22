import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { GetScaleRelatedDataResponseDto } from '../dtos/assessmentScale.dto';

export class GetEvaluationScaleRelatedDataService {
  run() {
    return axios.get<GetScaleRelatedDataResponseDto>(`${services.evaluationTeacher}/evaluation-scales/related-data`).then((response) => response.data);
  }
}
