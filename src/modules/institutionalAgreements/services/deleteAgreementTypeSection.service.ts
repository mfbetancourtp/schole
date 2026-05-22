import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteAgreementTypeSectionService {
  run(sectionId: string): Promise<void> {
    return axios.delete(`${services.structure}/agreements-types-sections/${sectionId}`).then(() => undefined);
  }
}
