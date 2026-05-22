import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

import { GetAcadPeriLevelAllCoursesDto } from '../../dto/classroom/academicPeriodCourse.dto';

export class GetAcadPeriLevelAllCoursesService {
  async run(academicPeriodGroupId: number) {
    const url = `${services.classroom}/classroom-administration/academic-period/${academicPeriodGroupId}/all-courses`;
    const response = await axios.get<GetAcadPeriLevelAllCoursesDto>(url);

    return response.data;
  }
}
