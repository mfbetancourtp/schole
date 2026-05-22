import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { CreateAreaSubjectSelectionDto } from '../dtos/academicLoad.dto';

export class CreateAreasSubjectsSelectionService {
  run(payload: CreateAreaSubjectSelectionDto) {
    return axios.post<any>(`${services.structure}/areas-subjects-selection`, payload).then((response) => response.data);
  }
}
