import { RequestTrackingRow } from '../dtos/requestTracking.dto';
import { requestTrackingMock } from '../mocks/requestTracking';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GetRequestTrackingTableService {
  async run(params?: { page?: number; perPage?: number; search?: string; serviceType?: string; status?: string; date?: string }): Promise<{
    data: RequestTrackingRow[];
    total: number;
    page: number;
    perPage: number;
  }> {
    await delay(600);

    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 10;
    const search = params?.search?.toLowerCase() ?? '';

    let items = [...requestTrackingMock];

    if (search) {
      items = items.filter((r) => r.student.name.toLowerCase().includes(search) || r.service.toLowerCase().includes(search) || r.statusLabel.toLowerCase().includes(search));
    }

    if (params?.serviceType) {
      items = items.filter((r) => r.service === params.serviceType);
    }

    if (params?.status) {
      items = items.filter((r) => r.status === params.status);
    }

    if (params?.date) {
      items = items.filter((r) => r.date.toLowerCase().includes(params.date!.toLowerCase()));
    }

    const total = items.length;
    const start = (page - 1) * perPage;
    const data = items.slice(start, start + perPage);

    return { data, total, page, perPage };
  }
}
