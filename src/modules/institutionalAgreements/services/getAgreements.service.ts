import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { AgreementDto } from '../dtos/agreement.dto';

interface GetAgreementsParams extends ParamsPaginationDto {
  code?: string;
  status?: string;
  institution?: string;
  search?: string;
}

export class GetAgreementsService {
  run(params?: GetAgreementsParams): Promise<ResponsePaginationDto<AgreementDto>> {
    return axios
      .get<ResponsePaginationDto<AgreementDto>>(`${services.structure}/agreements`, {
        params: {
          page: params?.page || 1,
          perPage: params?.perPage || 100,
          order: params?.order || 'ASC',
          search: params?.search,
          code: params?.code,
          status: params?.status,
          institution: params?.institution,
        },
      })
      .then((response) => response.data);
  }
}
