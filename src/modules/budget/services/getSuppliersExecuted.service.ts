import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
  budgetPlanningExecutedId?: number | null;
}
export class GetSuppliersExecutedService {
  run(params: IParams) {
    return axios
      .get(`${services.budget}/admin/suppliers-pagination-bills-executed`, {
        params,
      })
      .then((response) => response.data);
  }
}
