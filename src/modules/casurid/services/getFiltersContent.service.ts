import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {SubjectDto} from '../dtos/subject.dto';
import {LevelsDegreeDto} from '../dtos/levelsDegree.dto';
import {ContentTypeDto} from '../dtos/contentType.dto';


interface IGetFiltersContentService {
    subjects: SubjectDto[];
    levelsDegrees: LevelsDegreeDto[];
    contentTypes: ContentTypeDto[];
}

export class GetFiltersContentService {
    run() {
        return axios.get<IGetFiltersContentService>(`${services.casurid}/catalogue/related-data-contents`).then((response) => {
            return response.data;
        });
    }
}