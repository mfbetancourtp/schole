import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteModalityTypesService {
  async run(modalityTypesId: number): Promise<void> {
    await axios.delete(`${services.structure}/modality-types/${modalityTypesId}`);
  }
}
