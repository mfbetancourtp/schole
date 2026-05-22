import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAssociateSemesterTemplateSubject {
  async run(semesterTemplateSubjectId: number): Promise<void> {
    await axios.delete(`${services.curricularDesign}/semesterTemplates/deleteSemesterTemplateSubject/${semesterTemplateSubjectId}`);
  }
}
