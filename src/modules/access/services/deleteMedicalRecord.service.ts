import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteMedicalRecordService {
  async run(medicalRecordId: any) {
    await axios.delete(`${services.users}/people/medical-records/${medicalRecordId}`);
  }
}