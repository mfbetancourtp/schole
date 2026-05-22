import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { AreaSubjectSelectionDto } from '../dtos/academicLoad.dto';

export class GetAreasSubjectsSelectionService {
  run(userId: number) {
    return axios
      .get<any>(`${services.structure}/areas-subjects-selection`, {
        params: { userId, noPag: true },
      })
      .then((response) => response.data);
  }
}
