import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface AgreementApplicationsStatsDto {
  total: number;
  aprobadas: number;
  pendientes: number;
  rechazadas: number;
  pendienteDocs: number;
  cuposTotales: number;
  cuposDisponibles: number;
}

export class GetAgreementApplicationsStatsService {
  run(agreementId: number | string): Promise<AgreementApplicationsStatsDto> {
    return axios.get<AgreementApplicationsStatsDto>(`${services.structure}/agreements-institutional/${agreementId}/applications/stats`).then((r) => r.data);
  }
}
