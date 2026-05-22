import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { ApplicationDto } from '../dtos/application.dto';

interface GetApplicationsParams extends ParamsPaginationDto {
  agreementId: string | number;
  status?: string;
  search?: string;
}

export class GetApplicationsService {
  run(params: GetApplicationsParams): Promise<ResponsePaginationDto<ApplicationDto>> {
    const { agreementId, ...rest } = params;
    return axios
      .get<ResponsePaginationDto<ApplicationDto>>(`${services.structure}/agreements/${agreementId}/applications`, {
        params: {
          page: rest.page || 1,
          perPage: rest.perPage || 100,
          order: rest.order || 'ASC',
          status: rest.status,
          search: rest.search,
        },
      })
      .then((response) => response.data);
  }
}
