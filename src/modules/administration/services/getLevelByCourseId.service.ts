import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { LevelDto } from '../dtos/level.dto';

export class GetLevelByCourseIdService {
  run(courseId: number) {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Error: No se encontró el token en el localStorage.');
      return Promise.reject('No se encontró el token en el localStorage.');
    }

    return axios
      .get<LevelDto>(`${services.academic}/academic-programs/course/${courseId}/level`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error al obtener el nivel por Course ID:', error);
        throw error;
      });
  }
}
