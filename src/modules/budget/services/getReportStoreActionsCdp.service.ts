import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
  executionOfExpenseId: any;
}

export class GetReportStoreActionsCdpService {
  run(params: IParams) {
    return axios
      .get(`${services.budget}/admin/report-store-actions-budgets`, {
        params,
      })
      .then((response) => response.data);
  }
}
