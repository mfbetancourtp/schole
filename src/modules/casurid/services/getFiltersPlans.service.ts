import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {LevelsDegreeDto} from '../dtos/levelsDegree.dto';

interface IGetFiltersPlansService {
    levelsDegrees: LevelsDegreeDto[];
}

export class GetFiltersPlansService {
    run() {
        return axios.get<IGetFiltersPlansService>(`${services.casurid}/catalogue/related-data-contents`).then((response) => {
            return response.data;
        });
    }
}