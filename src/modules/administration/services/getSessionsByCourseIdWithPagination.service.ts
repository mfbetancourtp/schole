import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { GetAttendancesBySessionIdService } from './getAttendancesBySessionId.service';

const getAttendancesBySessionIdService = new GetAttendancesBySessionIdService();

export class GetSessionsByCourseIdWithPaginationService {
  run(params: any) {
    return axios.get(`${services.classroom}/classroom-implementation/courses/${params.courseId}/sessions`, { params }).then(async (response: any) => {
      const data = response.data;
      console.log('data', data);

      // for (let i = 0; i < data.data.length; i++) {
      //   const attendances = await getAttendancesBySessionIdService.run(data.data[i].id);
      //   console.log('w', attendances);
      //   if (attendances.length > 0) {
      //     data.data[i].isGeneral = attendances[0].isGeneral;
      //     data.data[i].roleName = attendances[0].roleName;
      //     data.data[i].attendanceList = attendances.length;
      //   } else {
      //     data.data[i].isGeneral = null;
      //     data.data[i].roleName = null;
      //     data.data[i].attendanceList = null;
      //   }
      // }

      return data;
    });
  }
}
