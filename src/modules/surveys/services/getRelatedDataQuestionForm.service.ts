import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {QuestionTypeDto} from '../dtos/questionType.dto';
import {TypesDataDto} from '../dtos/typesData.dto';

interface IGetRelatedDataQuestionFormService {
    questionTypes: QuestionTypeDto[];
    typesData: TypesDataDto[];
}

export class GetRelatedDataQuestionFormService {
    async run() {
        return axios.get<IGetRelatedDataQuestionFormService>(`${services.surveys}/admin/related-data-questions`).then(response => response.data);
    }
}