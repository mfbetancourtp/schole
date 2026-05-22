import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteFormatService {
  async run(formatId: number): Promise<void> {
    await axios.delete(`${services.structure}/annexes/${formatId}`);
  }
}
