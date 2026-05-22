import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class SaveAnswersCustomSectionService {
    async run(sectionId: any, data: any) {
        await axios.post(`${services.surveys}/answers-by-survey-section/${sectionId}`, data);
    }
}