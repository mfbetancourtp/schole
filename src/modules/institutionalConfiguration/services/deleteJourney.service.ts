import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteJourneyService {
    async run(journeyId: number): Promise<void> {
        await axios.delete(`${services.academic}/institutional-configuration/journeys/${journeyId}`);
    }
}