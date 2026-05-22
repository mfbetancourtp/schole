import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { OrganizationalInitDto } from '../dtos/configureEvaluations.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';

export class GetOrganizationalUnitsService {
  run() {
    return axios.get<ResponsePaginationDto<OrganizationalInitDto>>(`${services.organizational}/admin/organizational-units`).then((response) => response.data);
  }
}
