import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteWellnessAreasService {
    async run(wellnessAreasId: number): Promise<void> {
        await axios.delete(`${services.academic}/institutional-configuration/wellness-areas/${wellnessAreasId}`);
    }
}