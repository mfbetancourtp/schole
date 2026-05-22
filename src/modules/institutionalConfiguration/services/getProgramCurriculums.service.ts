import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ProgramCurriculumDto } from '../dtos/programCurriculum.dto';

interface IGetProgramCurriculumsParams {
  programId: number;
  noPag?: boolean;
  order?: string;
  id?: number;
}

export class GetProgramCurriculumsService {
  run(params: IGetProgramCurriculumsParams) {
    return axios.get<ProgramCurriculumDto[]>(`${services.structure}/program-curriculums`, { params }).then((response) => response.data);
  }
}
