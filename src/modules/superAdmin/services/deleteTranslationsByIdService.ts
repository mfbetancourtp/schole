import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteTranslationsByIdService {
    async run(translationId: number): Promise<void> {
        await axios.delete(`${services.admin}/languages-translations/translations/${translationId}`);
    }
}