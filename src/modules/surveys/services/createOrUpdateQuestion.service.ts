import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';
import {services} from '../../../shared/constant/services';
import {QuestionDto} from '../dtos/question.dto';

export class CreateOrUpdateQuestionService extends CreateOrUpdateBaseService<QuestionDto> {
    url = `${services.surveys}/admin/questions`;
}