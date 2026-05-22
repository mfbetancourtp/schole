import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { MenuItemDto } from '../dtos/menuItem.dto';

export interface GetMenuItemsParams extends ParamsPaginationDto {
  moduleId?: number | null;
  itemParentId?: number | null;
  showMenu?: number | null;
  isReport?: number | null;
  isActive?: number | null;
  noPag?: boolean;
}

export type GetMenuItemsResponse = ResponsePaginationDto<MenuItemDto> | MenuItemDto[];

export class GetMenuItemsService {
  run(params?: GetMenuItemsParams) {
    return axios
      .get<GetMenuItemsResponse>(`${services.v2}/menu/items`, {
        params,
      })
      .then((response) => response.data);
  }
}
