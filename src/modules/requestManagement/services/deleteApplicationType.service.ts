import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteApplicationTypeService {
  run(id: number) {
    return axios.delete<any>(`${services.structure}/application-types/${id}`).then((response) => response.data);
  }
}
