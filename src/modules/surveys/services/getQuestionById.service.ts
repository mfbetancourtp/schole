import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {QuestionDto} from '../dtos/question.dto';

export class GetQuestionByIdService {
    async run(questionId: number) {
        return axios.get<QuestionDto>(`${services.surveys}/admin/questions/${questionId}`).then(response => response.data);
    }
}