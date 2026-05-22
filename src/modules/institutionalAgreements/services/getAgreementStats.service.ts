import { AgreementDto, AgreementStatsDto } from '../dtos/agreement.dto';

export class GetAgreementStatsService {
  async run(agreements: AgreementDto[]): Promise<AgreementStatsDto> {
    const active = agreements.filter((a) => a.status === 'Activo');
    return Promise.resolve({
      activeCount: active.length,
      draftCount: agreements.filter((a) => a.status === 'Borrador').length,
      totalApplications: agreements.reduce((sum, a) => sum + a.totalApplications, 0),
      availableSlots: active.reduce((sum, a) => sum + (a.totalSlots - a.usedSlots), 0),
    });
  }
}
