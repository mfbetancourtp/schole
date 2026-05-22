import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteCompetencieService {
  async run(competenceId: number): Promise<void> {
    await axios.delete(`${services.academic}/competencies/${competenceId}`);
  }
}
