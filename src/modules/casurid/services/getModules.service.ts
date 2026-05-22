import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { MenuModuleDto, MenuModuleRouteState } from '../dtos/menuModule.dto';

export interface GetModulesParams extends ParamsPaginationDto {
  internalBase?: number | null;
  routeState?: MenuModuleRouteState | null;
}

export type GetModulesResponse = ResponsePaginationDto<MenuModuleDto> | MenuModuleDto[];

export class GetModulesService {
  run(params?: GetModulesParams) {
    return axios
      .get<GetModulesResponse>(`${services.v2}/menu/modules`, {
        params,
      })
      .then((response) => response.data);
  }
}
