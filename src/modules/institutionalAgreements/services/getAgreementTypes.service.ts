import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { AgreementTypeDto } from '../dtos/agreementType.dto';

interface GetAgreementTypesParams extends ParamsPaginationDto {
  code?: string;
  isActive?: number;
  applicability?: string;
  institutionId?: number;
  search?: string;
}

export class GetAgreementTypesService {
  run(params?: GetAgreementTypesParams): Promise<ResponsePaginationDto<AgreementTypeDto>> {
    return axios
      .get<ResponsePaginationDto<AgreementTypeDto>>(`${services.structure}/agreements-types`, {
        params: {
          page: params?.page || 1,
          perPage: params?.perPage || 10,
          order: params?.order || 'DESC',
          search: params?.search,
          code: params?.code,
          isActive: params?.isActive,
          applicability: params?.applicability,
          institutionId: params?.institutionId,
        },
      })
      .then((response) => response.data);
  }
}
