import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

import { GetTimeTableByCourseGroupDto } from '../dtos/getTimeTableByCourseGroup.dto';

export class GetTimeTableByCourseGroupService {
  async run(academicPeriodGroupId: number, params: { courseId?: number } = {}) {
    const url = `${services.classroom}/classroom-implementation/academic-period-group/${academicPeriodGroupId}/time-tables`;
    const response = await axios.get<GetTimeTableByCourseGroupDto>(url, {
      params,
    });

    return response.data;
  }
}
