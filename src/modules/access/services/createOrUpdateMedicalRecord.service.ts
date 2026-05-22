import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';

interface IParams {
  userId: number | null;
  annotations: string;
  wellnessAreaId: number;
  consultationDate: string;
}

export class CreateOrUpdateMedicalRecordService extends CreateOrUpdateBaseService<IParams> {
  url = `${services.users}/people/medical-records`;
}