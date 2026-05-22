import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { ChecklistDto } from '../../dtos/checklist.dto';

export interface GetChecklistsParams {
  /** Campo por el que ordenar. Por defecto `id` (asumimos id autoincremental). */
  sort?: string;
  /** Dirección de ordenamiento: `ASC` o `DESC`. Por defecto `ASC` en backend; nosotros usamos `DESC`. */
  order?: 'ASC' | 'DESC';
  /** Página para paginación. Por defecto `1`. */
  page?: number;
}

/**
 * Servicio de listado de checklists.
 *
 * Envía `sort` y `order` como query params al backend (ver Swagger de
 * `GET /forms/checklist`). Además aplica el mismo ordenamiento en cliente
 * como salvaguarda: si el backend ignora los params, igualmente devolvemos
 * el último creado primero.
 */
export class GetChecklistsService {
  async run(params: GetChecklistsParams = {}): Promise<ChecklistDto[]> {
    const sort = params.sort ?? 'id';
    const order: 'ASC' | 'DESC' = params.order ?? 'DESC';
    const page = params.page ?? 1;

    const response = await axios.get<{ data: ChecklistDto[] }>(`${services.forms}/checklist`, {
      params: { sort, order, page },
    });

    const items = response.data.data ?? [];

    // Fallback de ordenamiento en cliente por si el backend aún no soporta
    // los query params. Asume que `sort` apunta a un campo numérico o
    // comparable con operadores `<` / `>`.
    const key = sort as keyof ChecklistDto;
    const dir = order === 'ASC' ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }
}
