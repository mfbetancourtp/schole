import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

export interface FacultadDto {
  id: number;
  nombre: string;
  activo?: number;
}

interface RawFaculty {
  id: number;
  name?: string;
  nombre?: string;
  isActive?: number | boolean;
  activo?: number;
}

/**
 * Servicio para obtener facultades desde el backend de Structure.
 * Endpoint: GET ${services.structure}/faculties
 *
 * Reutiliza el mismo endpoint que usa InstitutionalConfiguration para CRUD
 * de facultades. Mapea `name` (campo del backend) a `nombre` para mantener
 * compatibilidad con el resto del módulo Checklists.
 */
export class GetFacultadesService {
  async run(): Promise<FacultadDto[]> {
    const response = await axios.get<{ data?: RawFaculty[] } | RawFaculty[]>(`${services.structure}/faculties`, {
      params: { noPag: true },
    });

    const raw: RawFaculty[] = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

    return raw.map((item) => ({
      id: item.id,
      nombre: item.nombre ?? item.name ?? '',
      activo: typeof item.activo === 'number' ? item.activo : item.isActive ? 1 : 0,
    }));
  }
}
