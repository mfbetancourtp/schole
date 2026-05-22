import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { AgreementsApplicationDto, AgreementsApplicationStatus } from '../dtos/agreementsApplication.dto';

export interface GetAgreementsApplicationsParams extends ParamsPaginationDto {
  id?: number;
  institutionId?: number;
  agreementsInstitutionalId?: number;
  userId?: number;
  agreementsTypesId?: number;
  countryId?: number;
  status?: AgreementsApplicationStatus;
}

export class GetAgreementsApplicationsListService {
  run(params?: GetAgreementsApplicationsParams): Promise<ResponsePaginationDto<AgreementsApplicationDto>> {
    return axios
      .get<ResponsePaginationDto<AgreementsApplicationDto>>(`${services.structure}/agreements-applications`, {
        params: {
          id: params?.id || undefined,
          sort: params?.sort || undefined,
          order: params?.order || 'ASC',
          page: params?.page || 1,
          perPage: params?.perPage || 10,
          search: params?.search || undefined,
          institutionId: params?.institutionId || undefined,
          agreementsInstitutionalId: params?.agreementsInstitutionalId || undefined,
          userId: params?.userId || undefined,
          agreementsTypesId: params?.agreementsTypesId || undefined,
          countryId: params?.countryId || undefined,
          status: params?.status || undefined,
        },
      })
      .then((r) => r.data);
  }
}
