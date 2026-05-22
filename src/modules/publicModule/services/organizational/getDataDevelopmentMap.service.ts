import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { DevelopmentMapDto } from '../../dtos/organizational/developmentMap.dto';

export class GetDataDevelopmentMapService {
  run(organizationalJobId: number, employeeId: number) {
    return axios.get<DevelopmentMapDto>(`${services.organizational}/development-map?organizationalJobId=${organizationalJobId}&employeeId=${employeeId}`).then((response) => response.data);
  }
}
