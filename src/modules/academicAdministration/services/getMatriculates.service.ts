import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
  curriculumOfferingId: number;
  isRetired: number;
}

export class GetMatriculatesService {
  run(params: IParams) {
    return axios
      .get(`${services.academicAdministration}/matriculates`, {
        params,
      })
      .then((response) => response.data);
  }
}
