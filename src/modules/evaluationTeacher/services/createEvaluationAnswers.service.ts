import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { SaveEvaluationAnswersDto } from '../dtos/evaluationQuestions.dto';

export class CreateEvaluationAnswersService {
  run(data: SaveEvaluationAnswersDto): Promise<any> {
    return axios.post(`${services.evaluationExecution}/save-answers`, data).then((response) => response.data);
  }
}
