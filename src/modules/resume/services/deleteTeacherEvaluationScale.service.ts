import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteTeacherEvaluationScaleService {
  async run(teacherEvaluationScaleId: number): Promise<void> {
    await axios.delete(`${services.structure}/teacher-evaluation-scales/${teacherEvaluationScaleId}`);
  }
}
