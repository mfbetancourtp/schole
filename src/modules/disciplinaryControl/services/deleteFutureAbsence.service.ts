import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteFutureAbsenceService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.classroom}/classroom-implementation/future-absences/${id}`);
  }
}
