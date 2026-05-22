import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class UpdateEnrollProgressService {
  async run(convocationEnrolId: number, convocationStepId: number): Promise<void> {
    await axios.post(`${services.academic}/convocations/enrolls/${convocationEnrolId}/update-progress`, {
      convocationStepId,
    });
  }
}
