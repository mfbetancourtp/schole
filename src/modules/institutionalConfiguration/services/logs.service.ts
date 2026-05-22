import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { IParamsLogs } from '../dtos/logs.dto';

export class LogsService {
  async getLogs(params?: IParamsLogs) {
    const url = `${services.users}/access/audit/logs`;
    const response = await axios.get<any>(url, { params });

    return response.data;
  }

  async getPasswordEventsLogs(params?: IParamsLogs) {
    const url = `${services.users}/access/audit/password-events-logs`;
    const response = await axios.get<any>(url, { params });

    return response.data;
  }
}
