import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

interface QuestionOrderItem {
  id: number;
  orden: number;
}

export class UpdateOrderChecklistQuestionsService {
  async run(items: QuestionOrderItem[]): Promise<void> {
    await axios.patch(`${services.forms}/pregunta/reorder`, items);
  }
}
