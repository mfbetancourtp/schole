import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface DataTableParams {
  page?: number;
  perPage?: number;
  search?: string;
  [key: string]: unknown;
}

/**
 * AppDatatable expects: { data: [...], total: number, page: number }
 */
interface DataTableResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  perPage: number;
}

export class GetTimetablesForTableService {
  async run(params: DataTableParams): Promise<DataTableResponse> {
    try {
      const response = await axios.get(`${services.smartClassroom}/timetables`);
      const rawData = response.data;

      // API returns a plain array of timetables
      const allData: Record<string, unknown>[] = Array.isArray(rawData) ? rawData : [];

      const page = params?.page || 1;
      const perPage = params?.perPage || 10;
      const search = (params?.search || '').toLowerCase();

      // Client-side search
      let filtered = allData;
      if (search) {
        filtered = allData.filter((item) => Object.values(item).some((val) => typeof val === 'string' && val.toLowerCase().includes(search)));
      }

      // Ordenar por fecha de creación descendente (más reciente primero)
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
        return dateB - dateA;
      });

      const total = filtered.length;
      const start = (page - 1) * perPage;
      const paginated = filtered.slice(start, start + perPage);

      return { data: paginated, total, page, perPage };
    } catch {
      return { data: [], total: 0, page: 1, perPage: 10 };
    }
  }
}
