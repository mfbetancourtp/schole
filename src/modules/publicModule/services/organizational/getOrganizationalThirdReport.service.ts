import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { RelatedDataDto } from '../../dtos/organizational/organizationalUnits.dto';

export class GetDataOrganizationalThirdReportService {
  run(params: any) {
    return axios.get<any>(`${services.organizational}/third-development-map-report-related-data`, { params }).then((response) => response.data);
  }
}
