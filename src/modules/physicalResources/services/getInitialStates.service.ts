import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { InitialStateDto } from '../dtos/initialState.dto';

export interface GetInitialStatesParams {
  /** Campo por el que ordenar. Por defecto `id`. */
  sort?: string;
  /** Dirección de ordenamiento. Por defecto `ASC`. */
  order?: 'ASC' | 'DESC';
  /** Página. Por defecto `1`. */
  page?: number;
  /** Si es `true`, el backend devuelve todos los registros sin paginación. */
  noPag?: boolean;
  /** Registros por página. */
  perPage?: number;
  /** Filtro de búsqueda por texto. */
  search?: string;
  /** Id de la institución (si aplica). */
  institutionId?: number;
}

/**
 * Servicio de listado de estados iniciales para recursos académicos.
 *
 * Endpoint: `GET /academic/initial-states`
 * Params soportados por backend (ver Swagger): sort, order, page, noPag,
 * perPage, search, institutionId.
 */
export class GetInitialStatesService {
  async run(params: GetInitialStatesParams = {}): Promise<InitialStateDto[]> {
    const query = {
      sort: params.sort ?? 'id',
      order: params.order ?? 'ASC',
      noPag: params.noPag ?? true,
      ...(params.page ? { page: params.page } : {}),
      ...(params.perPage ? { perPage: params.perPage } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.institutionId ? { institutionId: params.institutionId } : {}),
    };

    const response = await axios.get<{ data: InitialStateDto[] } | InitialStateDto[]>(`${services.academic}/initial-states`, {
      params: query,
    });

    const payload = response.data as any;
    const items: InitialStateDto[] = Array.isArray(payload) ? payload : payload?.data ?? [];
    return items;
  }
}
