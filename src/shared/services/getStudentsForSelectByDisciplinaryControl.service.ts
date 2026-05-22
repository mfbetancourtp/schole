import axios from '../utils/axios';
import { services } from '../constant/services';

import { ResponsePaginationDto } from '../dto/responsePagination.dto';

export class GetStudentsForSelectByDisciplinaryControlService {
  run(params: any) {
    return axios
      .get<ResponsePaginationDto<any>>(
        `${services.users}/access/students-for-select-by-disciplinary-control`,
        { params }
      )
      .then((response) => response.data);
  }
}
