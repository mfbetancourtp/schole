import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteSectionCustomFormService {
    async run(sectionId: number): Promise<void> {
        await axios.delete(`${services.surveys}/admin/survey-sections/${sectionId}`);
    }
}