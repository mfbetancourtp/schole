import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { FacultyDto } from '../dtos/applicationProject.dto';

interface IGetFacultiesParams {
  page?: number;
  perPage?: number;
  noPag?: string;
  search?: string;
  order?: string;
}

export class GetFacultiesService {
  run(params: IGetFacultiesParams = {}) {
    return axios.get<FacultyDto[]>(`${services.structure}/faculties`, { params }).then((r) => r.data);
  }
}
