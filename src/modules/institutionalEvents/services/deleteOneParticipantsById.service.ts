import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteOneParticipantsByIdService {
  async run(
    id: number,
    academicPeriodGroupId: number,
    roleId: number,
    userId: number,
  ): Promise<void> {
    await axios.delete(`${services.configurations}/delete-views-institutional-activities/${id}?academicPeriodGroupId=${academicPeriodGroupId}&roleId=${roleId}&userId=${userId}`);
  }
}
