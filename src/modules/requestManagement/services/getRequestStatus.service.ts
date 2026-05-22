import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { RequestStatusDto } from '../dtos/requestManagement.dto';

export class GetRequestStatusService {
  async run(): Promise<RequestStatusDto[]> {
    return axios
      .get<RequestStatusDto[]>(`${services.structure}/request-status`, {
        params: { noPag: true },
      })
      .then((response) => response.data);
  }
}
