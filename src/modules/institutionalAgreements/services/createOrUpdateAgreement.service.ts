import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateOrUpdateAgreementDto {
  code: string;
  name: string;
  tipo: string;
  institution: string;
  country: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  status: 'Activo' | 'Borrador' | 'Finalizado';
}

export class CreateOrUpdateAgreementService extends CreateOrUpdateBaseService<CreateOrUpdateAgreementDto> {
  url = `${services.structure}/agreements`;
}
