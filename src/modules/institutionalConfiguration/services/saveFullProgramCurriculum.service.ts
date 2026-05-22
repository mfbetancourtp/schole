import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export interface ProgramCurriculumPeriodSubjectPayload {
  id?: number;
  curriculumPeriodId?: number;
  subjectId: number;
  prerequisiteIds: number[];
}

export interface ProgramCurriculumPeriodPayload {
  id?: number;
  programCurriculumId: number;
  name: string;
  code: string;
  description: string;
  state: string;
  periodSubjects: ProgramCurriculumPeriodSubjectPayload[];
}

export interface ProgramCurriculumFullPayload {
  curriculumPeriods: ProgramCurriculumPeriodPayload[];
}

export class SaveFullProgramCurriculumService {
  async run(programCurriculumId: number, data: ProgramCurriculumFullPayload) {
    return axios.post(`${services.structure}/program-curriculums/full-curriculum/${programCurriculumId}`, data).then((response) => response.data);
  }
}
