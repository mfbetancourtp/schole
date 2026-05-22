import axios from '../utils/axios';
import {services} from '../constant/services';
import {InitDataDto} from '../dto/initData.dto';

export class GetInitDataService {
    async run(): Promise<InitDataDto> {
        return axios.get<InitDataDto>(`${services.users}/access/users/get-init-data`).then((response) => {
            return response.data;
        });
    }
}