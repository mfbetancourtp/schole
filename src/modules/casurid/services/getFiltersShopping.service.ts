import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {LevelDto} from '../dtos/level.dto';
import {DegreeDto} from '../dtos/degree.dto';
import {SubjectDto} from '../dtos/subject.dto';

interface IGetFiltersShoppingService {
    levels: LevelDto[];
    degrees: DegreeDto[];
    subjects: SubjectDto[];
}

export class GetFiltersShoppingService {
    run() {
        return axios.get<IGetFiltersShoppingService>(`${services.casurid}/purchases/related-data-csd-curriculum-products`).then((response) => {
            return response.data;
        });
    }
}