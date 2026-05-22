import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetAgreementsApplicationTrackingService {
  run(agreementsApplicationId: number) {
    return axios.get(`${services.structure}/agreements-applications-tracking/${agreementsApplicationId}`).then((r) => r.data);
  }
}
