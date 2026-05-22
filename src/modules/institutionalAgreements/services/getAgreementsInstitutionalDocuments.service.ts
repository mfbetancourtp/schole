import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { InstitutionalAgreementDocumentDto } from '../dtos/institutionalAgreement.dto';

export interface GetAgreementsInstitutionalDocumentsParams extends ParamsPaginationDto {
  agreementsInstitutionalId?: number;
  required?: number;
}

export class GetAgreementsInstitutionalDocumentsService {
  run(params?: GetAgreementsInstitutionalDocumentsParams): Promise<ResponsePaginationDto<InstitutionalAgreementDocumentDto>> {
    return axios
      .get<ResponsePaginationDto<InstitutionalAgreementDocumentDto>>(`${services.structure}/agreements-institutional-documents`, {
        params: {
          order: params?.order || 'ASC',
          page: params?.page || 1,
          perPage: params?.perPage || 100,
          noPag: params?.noPag || undefined,
          search: params?.search || undefined,
          agreementsInstitutionalId: params?.agreementsInstitutionalId || undefined,
          required: params?.required ?? undefined,
        },
      })
      .then((response) => response.data);
  }
}
