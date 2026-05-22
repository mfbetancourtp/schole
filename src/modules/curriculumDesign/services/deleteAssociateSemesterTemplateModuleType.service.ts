import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAssociateSemesterTemplateModuleTypeService {
  async run(semesterTemplateModuleTypeId: number): Promise<void> {
    await axios.delete(`${services.curricularDesign}/semesterTemplates/deleteSemesterTemplateModuleType/${semesterTemplateModuleTypeId}`);
  }
}
