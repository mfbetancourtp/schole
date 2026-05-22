import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';

import { MsgWithReportIdDto } from '../../dtos/reportResponse.dto';

export class DownloadObserverReportsService {
  async run(params: any): Promise<MsgWithReportIdDto> {
    return axios
      .get(`${services.reports}/report-store/download-observer-reports`, {
        params,
      })
      .then((response) => response.data);
  }
}
