import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class DeleteRatingScaleDetailByIdService {
    async run(ratingScaleDetailId: number) {
        await axios.delete(`${services.academic}/academic-programs/rating-scale-details/${ratingScaleDetailId}`);
    }
}