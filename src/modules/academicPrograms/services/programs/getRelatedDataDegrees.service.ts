import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { RelatedDataDto } from '../../dtos/programs/relatedData.dto';

export class GetRelatedDataDegreesService {
  run(levelId: number) {
    return axios.get<RelatedDataDto[]>(`${services.academic}/academic-programs/degrees-related-data/${levelId}`).then((response) => response.data);
  }
}
