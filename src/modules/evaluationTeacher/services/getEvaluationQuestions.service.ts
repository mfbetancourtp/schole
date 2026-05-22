import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { EvaluationQuestionsResponseDto } from '../dtos/evaluationQuestions.dto';

export class GetEvaluationQuestionsService {
  run(assignmentId: number): Promise<EvaluationQuestionsResponseDto> {
    return axios.get(`${services.evaluationExecution}/assignment/${assignmentId}/questions`).then((response) => response.data);
  }
}
