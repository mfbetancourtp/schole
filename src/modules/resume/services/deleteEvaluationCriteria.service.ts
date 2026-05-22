import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEvaluationCriteriaService {
  async run(evaluationCriteriaId: number): Promise<void> {
    await axios.delete(`${services.structure}/evaluation-criteria/${evaluationCriteriaId}`);
  }
}
