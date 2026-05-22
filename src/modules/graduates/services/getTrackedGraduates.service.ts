import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetTrackedGraduatesService {
  run(filters?: Record<string, string>) {
    const qs = filters ? new URLSearchParams(filters).toString() : '';
    return axios.get(`${services.graduates}/tracking${qs ? '?' + qs : ''}`).then((r) => r.data);
  }
}
