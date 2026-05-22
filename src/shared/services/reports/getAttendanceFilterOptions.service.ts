import axios from '../../utils/axios';

import { services } from '../../constant/services';

import { GetAttendanceFilterOptionsDto } from '../../dto/reports/getAttendanceFilterOptions.dto';

export class GetAttendanceFilterOptionsService {
  async run(): Promise<GetAttendanceFilterOptionsDto> {
    const url = `${services.reports}/filters/related-data-attendance-by-course-and-dates`;
    const response = await axios.get<GetAttendanceFilterOptionsDto>(url);

    return response.data;
  }
}
