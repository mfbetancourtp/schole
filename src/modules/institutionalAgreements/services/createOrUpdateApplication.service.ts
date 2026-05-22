import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateOrUpdateApplicationDto {
  agreementId: string | number;
  studentName: string;
  studentDocument: string;
  studentProgram: string;
  studentSemester: number;
  grade: number;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

export class CreateOrUpdateApplicationService extends CreateOrUpdateBaseService<CreateOrUpdateApplicationDto> {
  url = `${services.structure}/applications`;
}
