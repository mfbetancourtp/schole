import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { GetAttendancesGeneralByListStudentService } from './getAttendancesGeneralByListStudent.service';

const getAttendancesGeneralByListStudentService = new GetAttendancesGeneralByListStudentService();

export class GetSessionsByCourseIdAttendanceGeneral {
  run(params: any) {
    return axios.get(`${services.classroom}/classroom-implementation/academic-period-groups/${params.academicPeriodGroupId}/sessions`, { params }).then(async (response: any) => {
      const data = response.data;
      // for (let i = 0; i < data.data.length; i++) {
      //   const attendances =
      //     await getAttendancesGeneralByListStudentService.run(
      //       data.data[i]?.dataCalender?.sessionIds
      //     );
      //   data.data[i].attendanceList = attendances.length;
      // }

      return data;
    });
  }
}
