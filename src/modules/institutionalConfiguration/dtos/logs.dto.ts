import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export interface IParamsLogs extends ParamsPaginationDto {
  initDate?: string | null;
  endDate?: string | null;
  country?: string | null;
  city?: string | null;
  deviceType?: string | null;
}
