import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { ProgramDto } from '../../../../shared/dto/program.dto';

export class GetProgramsService {
  run() {
    return axios
      .get<ProgramDto[]>(
        `${services.academic}/academic-programs/levels-with-degrees`
      )
      .then((response) => response.data);
  }
}
