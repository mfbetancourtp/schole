import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { EvaluationModelResponseDto } from '../dtos/evaluationModel.dto';

export class GetEvaluationModelsService {
  run(params?: any) {
    return axios.get<EvaluationModelResponseDto>(`${services.structure}/evaluation-models`, { params }).then((response) => response.data);
  }
}
