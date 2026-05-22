import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteQuestionService {
    async run(questionId: number): Promise<void> {
        await axios.delete(`${services.surveys}/admin/questions/${questionId}`);
    }
}