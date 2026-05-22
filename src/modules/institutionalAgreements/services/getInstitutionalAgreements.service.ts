import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { ResponsePaginationDto } from '../../../shared/dto/responsePagination.dto';
import { InstitutionalAgreementDto, InstitutionalAgreementStatus } from '../dtos/institutionalAgreement.dto';

export interface GetInstitutionalAgreementsParams extends ParamsPaginationDto {
  noFlag?: boolean;
  institutionId?: number;
  agreementsTypesId?: number;
  facultyId?: number;
  programId?: number;
  countryId?: number;
  code?: string;
  startDateFrom?: string;
  startDateTo?: string;
  agreementStatus?: InstitutionalAgreementStatus;
}

export class GetInstitutionalAgreementsService {
  run(params?: GetInstitutionalAgreementsParams): Promise<ResponsePaginationDto<InstitutionalAgreementDto>> {
    return axios.get<ResponsePaginationDto<InstitutionalAgreementDto>>(`${services.structure}/agreements-institutional`, { params }).then((r) => r.data);
  }
}
