import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

/**
 * Servicio que obtiene la lista de espacios desde el backend y la
 * normaliza para el datatable de "Asignación de espacios y recursos".
 *
 * El backend devuelve `spaceType` y `floor.building.campus` como
 * objetos anidados. Aquí aplanamos para las columnas que el datatable
 * espera por nombre plano:
 *  - `spaceTypeName`     ← `spaceType.name`
 *  - `hierarchicalPath`  ← `Campus › Edificio › Piso`
 *  - `isActive`          ← boolean (puede venir como 0/1)
 *
 * Mantenemos intactos los ids originales (`spaceTypeId`, `floorId`,
 * `buildingId`, `campusId`, `responsibleUserId`, etc.) porque los usa
 * el drawer de edición.
 */
export class GetSpacesService {
  async run(params?: any) {
    const response = await axios.get(`${services.academic}/spaces`, { params });
    const payload = response.data;

    const rawList: any[] = Array.isArray(payload) ? payload : payload?.data ?? [];
    const normalizedList = rawList.map((item) => {
      const floor = item?.floor ?? null;
      const building = floor?.building ?? null;
      const campus = building?.campus ?? null;

      const hierarchicalParts = [campus?.name, building?.name, floor?.name].filter(Boolean) as string[];

      return {
        ...item,
        spaceTypeName: item?.spaceType?.name ?? '',
        hierarchicalPath: hierarchicalParts.join(' › '),
        // Fallback: si el backend no manda el id directo, lo derivamos del objeto anidado.
        buildingId: item?.buildingId ?? building?.id ?? null,
        campusId: item?.campusId ?? campus?.id ?? building?.campusId ?? null,
        isActive: item?.isActive === 1 || item?.isActive === true,
      };
    });

    return {
      ...payload,
      data: normalizedList,
    };
  }
}
