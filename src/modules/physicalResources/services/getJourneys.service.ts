import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { JourneyDto } from '../dtos/journey.dto';

export class GetJourneysService {
  run() {
    return axios.get<JourneyDto[]>(`${services.structure}/journeys`).then((response) => response.data);
  }
}
