import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { AgreementsApplicationStatus } from '../dtos/agreementsApplication.dto';

export interface GetAgreementApplicationsParams extends ParamsPaginationDto {
  institutionId?: number;
  status?: AgreementsApplicationStatus;
  desde?: string;
  hasta?: string;
}

export class GetAgreementApplicationsService {
  constructor(private agreementId: number | string) {}

  run(params?: GetAgreementApplicationsParams): Promise<ResponsePaginationDto<any>> {
    return axios
      .get<ResponsePaginationDto<any>>(`${services.structure}/agreements-institutional/${this.agreementId}/applications`, {
        params: {
          sort: params?.sort || undefined,
          order: params?.order || 'ASC',
          page: params?.page || 1,
          perPage: params?.perPage || 10,
          search: params?.search || undefined,
          institutionId: params?.institutionId || undefined,
          status: params?.status || undefined,
          desde: params?.desde || undefined,
          hasta: params?.hasta || undefined,
        },
      })
      .then((r) => r.data);
  }
}
