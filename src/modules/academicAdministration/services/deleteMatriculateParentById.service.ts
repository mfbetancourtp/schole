import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteMatriculateParentByIdservice {
  async run(matriculateId: number) {
    return axios
      .delete(
        `${services.academic}/academic-administration/matriculate-parents/${matriculateId}`
      )
      .then((response) => response.data);
  }
}
