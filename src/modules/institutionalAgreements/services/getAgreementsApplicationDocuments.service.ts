import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { AgreementsApplicationDocumentDto, AgreementsApplicationDocumentStatus } from '../dtos/agreementsApplicationDocument.dto';

export interface GetAgreementsApplicationDocumentsParams extends ParamsPaginationDto {
  institutionId?: number;
  agreementsApplicationId?: number;
  status?: AgreementsApplicationDocumentStatus;
}

export class GetAgreementsApplicationDocumentsService {
  run(params?: GetAgreementsApplicationDocumentsParams): Promise<ResponsePaginationDto<AgreementsApplicationDocumentDto>> {
    return axios
      .get<ResponsePaginationDto<AgreementsApplicationDocumentDto>>(`${services.structure}/agreements-applications-documents`, {
        params: {
          sort: params?.sort || undefined,
          order: params?.order || 'ASC',
          page: params?.page || 1,
          perPage: params?.perPage || 10,
          search: params?.search || undefined,
          institutionId: params?.institutionId || undefined,
          agreementsApplicationId: params?.agreementsApplicationId || undefined,
          status: params?.status || undefined,
        },
      })
      .then((r) => r.data);
  }

  getByApplicationId(applicationId: number): Promise<AgreementsApplicationDocumentDto[]> {
    return axios
      .get<ResponsePaginationDto<AgreementsApplicationDocumentDto>>(`${services.structure}/agreements-applications-documents`, {
        params: {
          agreementsApplicationId: applicationId,
          perPage: 100,
        },
      })
      .then((r) => r.data.data || []);
  }
}
