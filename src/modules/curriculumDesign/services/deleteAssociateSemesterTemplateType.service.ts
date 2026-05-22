import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAssociateSemesterTemplateType {
  async run(semesterTemplateTypeId: number): Promise<void> {
    await axios.delete(`${services.structure}/semesterTemplates/deleteSemesterTemplateTypes/${semesterTemplateTypeId}`);
  }
}
