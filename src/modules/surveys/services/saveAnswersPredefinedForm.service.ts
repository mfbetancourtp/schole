import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class SaveAnswersPredefinedFormService {
    async run(params: any, data: object): Promise<void> {
        const querys = `procedure=${params.procedure}&convocationEnrolId=${params.convocationEnrolId}`;

        return await axios.post(`${services.academic}/academic-planning/execute-process/${params.sectionId}?${querys}`, data)
            .then(response => response.data);
    }
}