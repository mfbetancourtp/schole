import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export interface ApplicationTypeDto {
  id: number;
  code: string;
  name: string;
  description: string;
  paymentRequired: boolean;
  isActive: boolean;
  applicationCategory: {
    id: number;
    name: string;
  };
}

export class GetApplicationTypesService {
  run(params?: Partial<ParamsPaginationDto> & { search?: string }) {
    return axios.get<any>(`${services.structure}/application-types`, { params }).then((response) => response.data);
  }
}
