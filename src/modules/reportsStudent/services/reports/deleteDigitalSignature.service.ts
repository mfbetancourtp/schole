import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export class DeleteDigitalSignatureService {
  async run(digitalSignatureId: number): Promise<void> {
    await axios.delete(`${services.reports}/digital-signature/${digitalSignatureId}`);
  }
}
