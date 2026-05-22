import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

interface AnswerOptionOrderItem {
  id: number;
  orden: number;
}

export class UpdateOrderAnswerOptionsService {
  async run(items: AnswerOptionOrderItem[]): Promise<void> {
    await axios.patch(`${services.forms}/opcion-respuesta/reorder`, items);
  }
}
