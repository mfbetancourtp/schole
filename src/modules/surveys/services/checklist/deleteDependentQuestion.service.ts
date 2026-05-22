import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DeleteDependentQuestionService {
  async run(id: number): Promise<void> {
    await axios.delete(`${services.forms}/pregunta-dependiente/${id}`);
  }
}
