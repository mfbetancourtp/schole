import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IGetSubjectsByProgramParams {
  programId: number;
  noPag?: boolean;
}

export class GetSubjectsByProgramService {
  run(params: IGetSubjectsByProgramParams) {
    return axios.get(`${services.structure}/subjects`, { params }).then((response) => response.data);
  }
}
