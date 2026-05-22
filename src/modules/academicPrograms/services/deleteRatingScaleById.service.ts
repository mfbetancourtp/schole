import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteRatingScaleByIdService {
    async run(ratingScaleId: number) {
        await axios.delete(`${services.academic}/academic-programs/rating-scales/${ratingScaleId}`);
    }
}