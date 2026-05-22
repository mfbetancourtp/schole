import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { OrganizationalUnitsDto } from '../../dtos/organizational/organizationalUnits.dto';

export class GetDataOrganizationalUnitsService {
  run(employeeId: number, organizationalUnitId: number | null = null, organizationalJobId: number | null = null) {
    return axios
      .get<OrganizationalUnitsDto>(
        `${services.organizational}/development-map-related-data`, {
          params: {
            employeeId, organizationalUnitId, organizationalJobId
          }
        }
      )
      .then((response) => response.data);
  }
}
