import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import {ProfileDto} from '../../../shared/dto/profile.dto';

export class GetRoleRelatedDataFormService {
    async run() {
        return axios.get<{ profiles: ProfileDto[] }>(`${services.users}/access/roles-related-data-form`).then(response => response.data);
    }
}