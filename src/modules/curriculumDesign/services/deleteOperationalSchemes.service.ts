import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteOperationalSchemesService {
  async run(operationalSchemeId: number): Promise<void> {
    await axios.delete(`${services.structure}/operational-schemes/${operationalSchemeId}`);
  }
}
