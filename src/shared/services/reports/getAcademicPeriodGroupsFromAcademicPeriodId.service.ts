import axios from '../../utils/axios';

import { services } from '../../constant/services';

import { GetAcademicPeriodGroupsDto } from '../../dto/reports/getAcademicPeriodGroups.dto';

export class GetAcademicPeriodGroupsFromAcademicPeriodIdService {
  async run(academicPeriodId: number): Promise<GetAcademicPeriodGroupsDto> {
    const url = `${services.reports}/filters/academic-period-groups-by-academic-period/${academicPeriodId}`;
    const response = await axios.get<GetAcademicPeriodGroupsDto>(url);

    return response.data;
  }
}
