import { Appointment, AppointmentsData } from '../dtos/myAppointments.dto';
import { myAppointmentsMock } from '../mocks/myAppointments';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GetMyAppointmentsTableService {
  async run(params?: { page?: number; perPage?: number; search?: string }): Promise<{
    data: Appointment[];
    total: number;
    page: number;
    perPage: number;
  }> {
    await delay(600);

    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 10;
    const search = params?.search?.toLowerCase() ?? '';

    let items = [...myAppointmentsMock.appointments];

    if (search) {
      items = items.filter(
        (a) => a.date.toLowerCase().includes(search) || a.time.toLowerCase().includes(search) || a.service.toLowerCase().includes(search) || a.statusLabel.toLowerCase().includes(search)
      );
    }

    const total = items.length;
    const start = (page - 1) * perPage;
    const data = items.slice(start, start + perPage);

    return { data, total, page, perPage };
  }
}

class MyAppointmentsSummaryService {
  async getSummary(): Promise<AppointmentsData['summary']> {
    await delay(400);
    return myAppointmentsMock.summary;
  }
}

export const myAppointmentsSummaryService = new MyAppointmentsSummaryService();
