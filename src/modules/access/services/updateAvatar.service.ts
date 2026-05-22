import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class UpdateAvatarService {
    async run(userId: number | null, avatar: string) {
        let pathParameter = '';

        if (userId) {
            pathParameter = `/${userId}`;
        }

        const formData = new FormData();
        formData.append('avatar', avatar);

        return axios.post(`${services.users}/people/general/profile-avatar${pathParameter}`, formData)
            .then(response => response.data);
    }
}