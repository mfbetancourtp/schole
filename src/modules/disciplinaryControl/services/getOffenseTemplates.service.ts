import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { OffenseTemplateDto } from '../dtos/offenseTemplate';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

export class GetOffenseTemplatesService {
  run(params?: ParamsPaginationDto) {
    return axios
      .get<OffenseTemplateDto[]>(`${services.classroom}/disciplinary-control/offense-templates`, {
        params,
      })
      .then((response) => response.data);
  }
}
