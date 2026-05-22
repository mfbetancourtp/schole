import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramCampusItem {
  campusId: number;
  programId: number;
}

export interface AddProgramsPayload {
  programsCampus: ProgramCampusItem[];
}

export class AddProgramsToAcademicPeriodService {
  async run(academicPeriodId: number, payload: AddProgramsPayload): Promise<any> {
    return axios.post(`${services.academic}/planning/academic-periods/${academicPeriodId}/add-programs`, payload).then((response) => response.data);
  }
}
