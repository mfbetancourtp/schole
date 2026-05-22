import { ApplicationDto, ApplicationStatsDto } from '../dtos/application.dto';

export class GetApplicationStatsService {
  async run(applications: ApplicationDto[], totalSlots: number, usedSlots: number): Promise<ApplicationStatsDto> {
    return Promise.resolve({
      total: applications.length,
      approved: applications.filter((a) => a.status === 'Aprobada').length,
      pending: applications.filter((a) => a.status === 'Pendiente').length,
      rejected: applications.filter((a) => a.status === 'Rechazada').length,
      availableSlots: totalSlots - usedSlots,
      totalSlots,
    });
  }
}
